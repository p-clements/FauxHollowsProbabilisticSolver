import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient import discovery
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
# Service account is required for read access to the Sheets API.
REPO_DIR = Path(__file__).resolve().parent
SERVICE_ACCOUNT_FILE = REPO_DIR / "service_account.json"
DATA_FILE = REPO_DIR / "data.js"

# Safe to hardcode, the sheet is public.
SPREADSHEET_ID = "1mUyCzlzDmdXMwaSTUgWXtEA45oJNn-iB4_bVM43zf58"
SOURCE_URL = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}"
RANGES = [
    "'A ↑ '!3:56",
    "'A →'!3:56",
    "'A ↓'!3:56",
    "'A ←'!3:56",
    "'B ↑'!3:40",
    "'B →'!3:40",
    "'B ↓'!3:40",
    "'B ←'!3:40",
    "'C ↑'!3:47",
    "'C →'!3:48",
    "'C ↓'!3:48",
    "'C ←'!3:48",
    "'D ↑'!3:56",
    "'D →'!3:56",
    "'D ↓'!3:56",
    "'D ←'!3:56",
]

# Sheet cell background colors, mapped to the value used for that cell.
COLOR_OOB = {"red": 0.8509804, "green": 0.8509804, "blue": 0.8509804}
COLOR_EMPTY = {"red": 1, "green": 1, "blue": 1}
COLOR_BLOCK = {"red": 0.6, "green": 0.6, "blue": 0.6}
COLOR_BOX = {"red": 0.91764706, "green": 0.6, "blue": 0.6}
COLOR_SWORD = {"red": 0.62352943, "green": 0.77254903, "blue": 0.9098039}
COLOR_SWORD_ALT = {"red": 0.6431373, "green": 0.7607843, "blue": 0.95686275}
COLOR_CONF = {"red": 1, "blue": 1}
COLOR_POT = {"red": 1, "green": 0.6}

COLOR_TO_VALUE = {
    tuple(sorted(COLOR_OOB.items())): 0,
    tuple(sorted(COLOR_EMPTY.items())): 1,
    tuple(sorted(COLOR_BLOCK.items())): 2,
    tuple(sorted(COLOR_BOX.items())): 3,
    tuple(sorted(COLOR_SWORD.items())): 4,
    tuple(sorted(COLOR_SWORD_ALT.items())): 4,
    tuple(sorted(COLOR_CONF.items())): 5,
    tuple(sorted(COLOR_POT.items())): 6,
}


def color_to_value(color):
    try:
        return COLOR_TO_VALUE[tuple(sorted(color.items()))]
    except KeyError as err:
        raise ValueError(f"Unknown cell background color: {color}") from err


def validate_data(data):
    """Reject incomplete or malformed snapshots before replacing data.js."""
    if len(data) != len(RANGES):
        raise ValueError(f"Expected {len(RANGES)} orientations, got {len(data)}")

    board_count = 0
    for orientation_index, orientation in enumerate(data):
        if not orientation:
            raise ValueError(f"Orientation {orientation_index} contains no boards")

        for board_index, board in enumerate(orientation):
            if len(board) != 6 or any(len(row) != 6 for row in board):
                raise ValueError(f"Orientation {orientation_index}, board {board_index} is not 6x6")

            if any(value not in range(6) for row in board for value in row):
                raise ValueError(
                    f"Orientation {orientation_index}, board {board_index} contains "
                    "an invalid cell value"
                )
            board_count += 1

    if board_count == 0:
        raise ValueError("Snapshot contains no boards")

    return board_count


def write_snapshot(data, output_path=DATA_FILE):
    """Atomically replace the checked-in snapshot after validation succeeds."""
    board_count = validate_data(data)
    output_path = Path(output_path)
    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    snapshot = (
        "/*\n"
        "\tPersisted snapshot generated from\n"
        f"\t{SOURCE_URL}\n"
        f"\tSnapshot generated at {generated_at}.\n"
        "\tCredit to u/Ylandah on r/FFXIV for creating and maintaining the "
        "spreadsheet.\n"
        "\tThanks to them and all contributors for collating this information.\n"
        "\tThe web app uses this checked-in snapshot and does not depend on the "
        "spreadsheet at runtime.\n"
        "*/\n"
        "const fhs_sheet_fox = "
        f"{json.dumps(data, separators=(',', ':'))};\n"
    )

    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=output_path.parent,
            prefix=f".{output_path.name}.",
            suffix=".tmp",
            delete=False,
        ) as snapshot_file:
            temporary_path = Path(snapshot_file.name)
            snapshot_file.write(snapshot)

        os.replace(temporary_path, output_path)
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)

    return board_count


def main():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = discovery.build("sheets", "v4", credentials=credentials)

    sheet = service.spreadsheets()
    try:
        result = sheet.get(
            spreadsheetId=SPREADSHEET_ID, ranges=RANGES, includeGridData=True
        ).execute()
    except HttpError as err:
        raise RuntimeError(f"Could not read source spreadsheet: {err}") from err

    if not result:
        raise ValueError("Source spreadsheet returned no data")

    sheets = result.get("sheets", [])
    if len(sheets) != len(RANGES):
        raise ValueError(f"Expected {len(RANGES)} sheets, got {len(sheets)}")

    # Extract background color data as raw values per cell.
    color_arr = []
    for sheet_index, sheet_data in enumerate(sheets):
        try:
            rows = sheet_data["data"][0]["rowData"]
        except (KeyError, IndexError) as err:
            raise ValueError(f"Orientation {sheet_index} has no grid data") from err

        color_sheet = []
        for row in rows:
            color_row = []
            for cell in row["values"]:
                try:
                    color = cell["effectiveFormat"]["backgroundColor"]
                except KeyError as err:
                    raise ValueError(
                        f"Orientation {sheet_index} contains a cell without a background color"
                    ) from err
                color_row.append(color_to_value(color))
            color_sheet.append(color_row)
        color_arr.append(color_sheet)

    # Each sheet packs several board layouts, separated by blank rows/columns.
    # Walk the grid and split it back out into individual boards.
    final_arr = []
    for c_sheet in color_arr:
        orientation = []
        current_boards = []
        repeat_empty_row = True
        current_board_row_index = 0
        for c_row in c_sheet:
            current_board_index = 0
            empty_row = True
            current_board_row = []
            current_board_row_written = False
            for elem in c_row:
                if elem != 0:
                    empty_row = False
                    repeat_empty_row = False
                    val = elem - 1
                    current_board_row.append(val)
                    current_board_row_written = False
                else:
                    if not empty_row:
                        if not current_board_row_written:
                            if len(current_boards) < current_board_index + 1:
                                current_boards.insert(current_board_index, [current_board_row])
                            else:
                                current_boards[current_board_index].insert(
                                    current_board_row_index, current_board_row
                                )
                            current_board_row_written = True
                            current_board_row = []
                        current_board_index = current_board_index + 1
            if empty_row:
                if not repeat_empty_row:
                    orientation.extend(current_boards)
                    current_boards = []
                repeat_empty_row = True
                current_board_row_index = 0
            else:
                current_board_row_index = current_board_row_index + 1
        if len(current_boards) > 0:
            orientation.extend(current_boards)
        final_arr.append(orientation)

    board_count = write_snapshot(final_arr)
    print(f"Wrote {board_count} validated boards to {DATA_FILE}")


if __name__ == "__main__":
    main()
