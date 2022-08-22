#!/usr/bin/env python3

"""Add info from wikipedia to IPA data

Note that this currently doesn't grab tones or diacritics, just the consonants
and vowels.

"""
import pandas as pd
from bs4 import BeautifulSoup
import requests
import numpy as np
import argparse

WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/International_Phonetic_Alphabet_chart'

def find_ipa(tag):
    return tag.has_attr('class') and tag['class'] == ['IPA'] and tag.a

def main(input_name, output_name):

    df = pd.read_csv(input_name)

    r = requests.get(WIKIPEDIA_URL)
    soup = BeautifulSoup(r.content)

    # grab those parts of the page that correspond to IPA letters
    ipas = soup.body.find_all(find_ipa)
    # for some reason, there's double of everything, so use list(set()) to unique it
    ipas = list(set(ipas))

    # define this here to avoid having to pass ipas as an argument
    def create_ipa_metadata(symbol, field):
        if field not in ['title', 'href']:
            raise Exception(f"Unsure how to handle {field}!")
        letter = [i.find('a') for i in ipas if i.find('a').contents[0] == symbol]
        assert len(letter) <= 1, "More than one matching letter!"
        try:
            return letter[0][field]
        except IndexError:
            # then there was no match
            return ''

    # grab name and url for each letter
    df['name'] = df.Symbol.apply(lambda x: create_ipa_metadata(x, 'title'))
    df['url'] = df.Symbol.apply(lambda x: 'https://en.wikipedia.org/' + create_ipa_metadata(x, 'href'))

    # drop those with no name (which means we couldn't find them on the page)
    df.name.replace('', np.nan, inplace=True)
    df = df.dropna(subset=['name'])

    df.to_csv(output_name)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=("Add name and wikipedia link to each IPA letter. "
                                                  "Currently, this only includes vowels and consonants "
                                                  "(not diacritics or tone marks)."))
    parser.add_argument('input_name', help='Path to IPA data csv, as downloaded from https://github.com/AdamSteffanick/ipa-data')
    parser.add_argument('output_name', help='Path to save output csv to')
    args = vars(parser.parse_args())
    main(**args)
