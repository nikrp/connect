import pandas as pd
import json

# Goal of this is to convert the data in the csv files into a combined array of school names and city, seperated by commas.

def combine_school_city(school, city, state):
    """
    Combines the school name and city into a single string.
    """
    return f"{school}, {city}, {state}"


def convert_csv_to_array(filename):
    """
    Converts the csv file into an array of school names and city, seperated by commas.
    """
    df = pd.read_csv(filename, delimiter=";")
    # Filter schools that have both ST_GRADE and END_GRADE between 9-12 (high schools)
    high_school_mask = (df['ST_GRADE'] == "09") & (df['END_GRADE'] == "12")
    filtered_df = df[high_school_mask]
    
    schools = filtered_df["NAME"].tolist()
    cities = filtered_df["CITY"].tolist()
    states = filtered_df["STATE"].tolist()
    combined = []
    for i in range(len(schools)):
        combined.append({"label": combine_school_city(str(schools[i]).title(), str(cities[i]).title(), str(states[i]).upper()), "value": combine_school_city(str(schools[i]).title(), str(cities[i]).title(), str(states[i]).upper()).lower()})
    return combined


def main():
    """
    Main function.
    """
    combined = convert_csv_to_array("C:\\Users\\nikrp\\Documents-Local\\CongressionalApp25\\connect\\src\\app\\api\\us-public-schools.csv")
    with open("schools.json", "w") as f:
        json.dump(combined, f, indent=4)

if __name__ == "__main__":
    main()