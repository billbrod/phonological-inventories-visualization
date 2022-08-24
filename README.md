# phonological-inventories-visualization

Visualization of the phonological inventories of different languages

`original_ipa_data.csv` is from
[ipa-data](https://github.com/AdamSteffanick/ipa-data), which we transform into
`ipa_data.csv` using our `add_wiki_ipa.py` script, as well as fix the following typos:
- `Manner_of_Articulation` for ᶑ: `imposive --> implosive`.
- `Place_of_Articulation` for x: `palatal --> velar`.
- `Manner_of_Articulation` for ʜ,ʢ: `fricative --> trill` (unsure if this is a
  typo vs. a convention, but these two don't appear to be present on the
  official IPA chart, and Wikipedia's [extended
  chart](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet_chart)
  classifies them as trills).

Helpful links:
- [wiktionary page on Yiddish pronunciation](https://en.wiktionary.org/wiki/Appendix:Yiddish_pronunciation)
- [wikipron](https://github.com/CUNY-CL/wikipron) for scraping wiktionary for
  pronunciation info. 
    - would love to get graphemes that correspond to phonemes, but this is
      apparently an open problem
    - possible solution: find grapheme that shows up most commonly in
      words/phrases containing the phoneme
- [IPA.js](https://anumat.com/blog/ipa-js/) for writing IPA symbols easily using
  mathjax
- [PHOIBLE FAQs](https://phoible.github.io/)
