import json
import os.path

from google.oauth2 import service_account
from googleapiclient import discovery
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
# Service account is required for read access to the Sheets API.
SERVICE_ACCOUNT_FILE = "service_account.json"

# Safe to hardcode, the sheet is public.
SPREADSHEET_ID = "1mUyCzlzDmdXMwaSTUgWXtEA45oJNn-iB4_bVM43zf58"
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
    val = COLOR_TO_VALUE.get(tuple(sorted(color.items())), -1)
    if val == -1:
        print(color)
    return val


def main():
    try:
        secret_file = os.path.join(os.getcwd(), SERVICE_ACCOUNT_FILE)
        credentials = service_account.Credentials.from_service_account_file(
            secret_file, scopes=SCOPES
        )
        service = discovery.build("sheets", "v4", credentials=credentials)

        sheet = service.spreadsheets()
        result = sheet.get(
            spreadsheetId=SPREADSHEET_ID, ranges=RANGES, includeGridData=True
        ).execute()
        if not result:
            print("No data found.")
            return

        # Extract background color data as raw values per cell.
        color_arr = []
        for sheet_data in result["sheets"]:
            color_sheet = []
            for row in sheet_data["data"][0]["rowData"]:
                color_row = [
                    color_to_value(cell["effectiveFormat"]["backgroundColor"])
                    for cell in row["values"]
                ]
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
                        val = elem - 1 if 1 <= elem <= 6 else -1
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

        with open("data.js", "w") as f:
            f.write(
                "/*\n\tScraped and parsed automatically from\n\t"
                "https://docs.google.com/spreadsheets/d/1mUyCzlzDmdXMwaSTUgWXtEA45oJNn-iB4_bVM43zf58"
                "\n\tCredit to u/Ylandah on r/FFXIV for creating and maintaining the "
                "spreadsheet.\n\t"
                "Thanks to them and all contributors for collating this information.\n\t"
                "Scraped using Google Sheets API and parsed using Python.\n*/\n"
            )
            f.write("const fhs_sheet_fox = ")
            json.dump(final_arr, f, separators=(",", ":"))

    except HttpError as err:
        print(err)


if __name__ == "__main__":
    main()
