import { describe, expect, test } from "@jest/globals";
import { parseMoney } from "../src/parseMoney";

/**
 * WIP FILE - Test file to test how robust this library is when faced with uncommon currencies.
 * 78 currencies have been tested for, on 5th April, 2026. Bugs will be fixed soon.
 * 
 * Need to modularise this and make it customisable for other uncommon currencies, but this can be done slowly.
 * Current requirements are complete with the most popular currencies.
Proposed Currency List (100+ Uncommon Currencies)

  Here's my initial list organized by region:

  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 79  │ Tunisian Dinar            │ TND  │ Tunisia              │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 80  │ Turkish Lira              │ TRY  │ Turkey               │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 81  │ Turkmenistani Manat       │ TMT  │ Turkmenistan         │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 82  │ Ugandan Shilling          │ UGX  │ Uganda               │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 83  │ Ukrainian Hryvnia         │ UAH  │ Ukraine              │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 84  │ Uzbekistani Som           │ UZS  │ Uzbekistan           │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 85  │ Venezuelan Bolívar        │ VES  │ Venezuela            │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 86  │ Vietnamese Đồng           │ VND  │ Vietnam              │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 87  │ Yemeni Rial               │ YER  │ Yemen                │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 88  │ Zambian Kwacha            │ ZMW  │ Zambia               │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 89  │ Zimbabwe Dollar           │ ZWD  │ Zimbabwe             │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 90  │ West African CFA Franc    │ XOF  │ West Africa          │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 91  │ CFP Franc                 │ XPF  │ French Polynesia     │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 92  │ East Caribbean Dollar     │ XCD  │ Caribbean            │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 93  │ Aruban Florin             │ AWG  │ Aruba                │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 94  │ Bahamian Dollar           │ BSD  │ Bahamas              │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 95  │ Barbadian Dollar          │ BBD  │ Barbados             │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 96  │ Belize Dollar             │ BZD  │ Belize               │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 97  │ Bermudian Dollar          │ BMD  │ Bermuda              │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 98  │ Cayman Islands Dollar     │ KYD  │ Cayman Islands       │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 99  │ Fiji Dollar               │ FJD  │ Fiji                 │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 100 │ Guyana Dollar             │ GYD  │ Guyana               │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 101 │ Namibian Dollar           │ NAD  │ Namibia              │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 102 │ Solomon Islands Dollar    │ SBD  │ Solomon Islands      │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 103 │ Sudanese Pound            │ SDG  │ Sudan                │
  ├─────┼───────────────────────────┼──────┼──────────────────────┤
  │ 104 │ Vanuatu Vatu              │ VUV  │ Vanuatu              │
  └─────┴───────────────────────────┴──────┴──────────────────────┘
 */

describe("Afghani (AFN)", () => {
  test("parses afghani currency name", () => {
    const res = parseMoney("73 afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(73);
  });

  test("parses afghanis plural", () => {
    const res = parseMoney("127 afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(127);
  });

  test("parses AFN ISO code before amount", () => {
    const res = parseMoney("AFN 843");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(843);
  });

  test("parses AFN ISO code after amount", () => {
    const res = parseMoney("1234 AFN");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(1234);
  });

  test("parses AFN with decimal", () => {
    const res = parseMoney("AFN 99.73");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(99.73);
  });

  test("parses afghani with decimal", () => {
    const res = parseMoney("456.28 afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(456.28);
  });

  test("parses Afghani with amount in sentence", () => {
    const res = parseMoney("The price is 999 Afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number afghani", () => {
    const res = parseMoney("five hundred and sixty-seven afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(567);
  });

  test("parses half afghani", () => {
    const res = parseMoney("half an afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one afghani", () => {
    const res = parseMoney("one afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three afghanis", () => {
    const res = parseMoney("twenty-three afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand afghanis", () => {
    const res = parseMoney("one thousand afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred afghanis", () => {
    const res = parseMoney("a hundred afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(100);
  });

  test("parses half million afghanis", () => {
    const res = parseMoney("half a million afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter afghani", () => {
    const res = parseMoney("a quarter afghani");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty afghanis", () => {
    const res = parseMoney("about fifty afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand afghanis", () => {
    const res = parseMoney("around one thousand afghanis");
    expect(res.currency).toBe("AFN");
    expect(res.amount).toBe(1000);
  });
});

describe("Albanian Lek (ALL)", () => {
  test("parses lek currency name", () => {
    const res = parseMoney("73 lek");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(73);
  });

  test("parses leke plural", () => {
    const res = parseMoney("127 leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(127);
  });

  test("parses ALL ISO code before amount", () => {
    const res = parseMoney("ALL 843");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(843);
  });

  test("parses ALL ISO code after amount", () => {
    const res = parseMoney("1234 ALL");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(1234);
  });

  test("parses ALL with decimal", () => {
    const res = parseMoney("ALL 456.78");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(456.78);
  });

  test("parses lek with decimal", () => {
    const res = parseMoney("99.25 leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Albanian Lek with amount in sentence", () => {
    const res = parseMoney("The price is 999 Albanian Lek");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number lek", () => {
    const res = parseMoney("five hundred and sixty-seven lek");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(567);
  });

  test("parses half lek", () => {
    const res = parseMoney("half a lek");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one lek", () => {
    const res = parseMoney("one lek");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three leke", () => {
    const res = parseMoney("twenty-three leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand leke", () => {
    const res = parseMoney("one thousand leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred leke", () => {
    const res = parseMoney("a hundred leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(100);
  });

  test("parses half million leke", () => {
    const res = parseMoney("half a million leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter lek", () => {
    const res = parseMoney("a quarter lek");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty leke", () => {
    const res = parseMoney("about fifty leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand leke", () => {
    const res = parseMoney("around one thousand leke");
    expect(res.currency).toBe("ALL");
    expect(res.amount).toBe(1000);
  });
});

describe("Algerian Dinar (DZD)", () => {
  test("parses dinar currency name", () => {
    const res = parseMoney("73 dinar");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(73);
  });

  test("parses dinars plural", () => {
    const res = parseMoney("127 dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(127);
  });

  test("parses DZD ISO code before amount", () => {
    const res = parseMoney("DZD 843");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(843);
  });

  test("parses DZD ISO code after amount", () => {
    const res = parseMoney("1234 DZD");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(1234);
  });

  test("parses DZD with decimal", () => {
    const res = parseMoney("DZD 456.78");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dinar with decimal", () => {
    const res = parseMoney("99.25 dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Algerian Dinar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Algerian Dinar");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dinar", () => {
    const res = parseMoney("five hundred and sixty-seven dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(567);
  });

  test("parses half dinar", () => {
    const res = parseMoney("half a dinar");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dinar", () => {
    const res = parseMoney("one dinar");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dinars", () => {
    const res = parseMoney("twenty-three dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dinars", () => {
    const res = parseMoney("one thousand dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dinars", () => {
    const res = parseMoney("a hundred dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dinars", () => {
    const res = parseMoney("half a million dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dinar", () => {
    const res = parseMoney("a quarter dinar");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dinars", () => {
    const res = parseMoney("about fifty dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dinars", () => {
    const res = parseMoney("around one thousand dinars");
    expect(res.currency).toBe("DZD");
    expect(res.amount).toBe(1000);
  });
});

describe("Armenian Dram (AMD)", () => {
  test("parses dram currency name", () => {
    const res = parseMoney("73 dram");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(73);
  });

  test("parses drams plural", () => {
    const res = parseMoney("127 drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(127);
  });

  test("parses AMD ISO code before amount", () => {
    const res = parseMoney("AMD 843");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(843);
  });

  test("parses AMD ISO code after amount", () => {
    const res = parseMoney("1234 AMD");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(1234);
  });

  test("parses AMD with decimal", () => {
    const res = parseMoney("AMD 456.78");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dram with decimal", () => {
    const res = parseMoney("99.25 drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Armenian Dram with amount in sentence", () => {
    const res = parseMoney("The price is 999 Armenian Dram");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dram", () => {
    const res = parseMoney("five hundred and sixty-seven drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(567);
  });

  test("parses half dram", () => {
    const res = parseMoney("half a dram");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dram", () => {
    const res = parseMoney("one dram");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three drams", () => {
    const res = parseMoney("twenty-three drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand drams", () => {
    const res = parseMoney("one thousand drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred drams", () => {
    const res = parseMoney("a hundred drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(100);
  });

  test("parses half million drams", () => {
    const res = parseMoney("half a million drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dram", () => {
    const res = parseMoney("a quarter dram");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty drams", () => {
    const res = parseMoney("about fifty drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand drams", () => {
    const res = parseMoney("around one thousand drams");
    expect(res.currency).toBe("AMD");
    expect(res.amount).toBe(1000);
  });
});

describe("Azerbaijani Manat (AZN)", () => {
  test("parses manat currency name", () => {
    const res = parseMoney("73 manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(73);
  });

  test("parses manat plural", () => {
    const res = parseMoney("127 manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(127);
  });

  test("parses AZN ISO code before amount", () => {
    const res = parseMoney("AZN 843");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(843);
  });

  test("parses AZN ISO code after amount", () => {
    const res = parseMoney("1234 AZN");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(1234);
  });

  test("parses AZN with decimal", () => {
    const res = parseMoney("AZN 456.78");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(456.78);
  });

  test("parses manat with decimal", () => {
    const res = parseMoney("99.25 manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Azerbaijani Manat with amount in sentence", () => {
    const res = parseMoney("The price is 999 Azerbaijani Manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number manat", () => {
    const res = parseMoney("five hundred and sixty-seven manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(567);
  });

  test("parses half manat", () => {
    const res = parseMoney("half a manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one manat", () => {
    const res = parseMoney("one manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three manat", () => {
    const res = parseMoney("twenty-three manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand manat", () => {
    const res = parseMoney("one thousand manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred manat", () => {
    const res = parseMoney("a hundred manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(100);
  });

  test("parses half million manat", () => {
    const res = parseMoney("half a million manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter manat", () => {
    const res = parseMoney("a quarter manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty manat", () => {
    const res = parseMoney("about fifty manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand manat", () => {
    const res = parseMoney("around one thousand manat");
    expect(res.currency).toBe("AZN");
    expect(res.amount).toBe(1000);
  });
});

describe("Belarusian Ruble (BYN)", () => {
  test("parses ruble currency name", () => {
    const res = parseMoney("73 ruble");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(73);
  });

  test("parses rubles plural", () => {
    const res = parseMoney("127 rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(127);
  });

  test("parses BYN ISO code before amount", () => {
    const res = parseMoney("BYN 843");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(843);
  });

  test("parses BYN ISO code after amount", () => {
    const res = parseMoney("1234 BYN");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(1234);
  });

  test("parses BYN with decimal", () => {
    const res = parseMoney("BYN 456.78");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(456.78);
  });

  test("parses ruble with decimal", () => {
    const res = parseMoney("99.25 rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Belarusian Ruble with amount in sentence", () => {
    const res = parseMoney("The price is 999 Belarusian Ruble");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number ruble", () => {
    const res = parseMoney("five hundred and sixty-seven rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(567);
  });

  test("parses half ruble", () => {
    const res = parseMoney("half a ruble");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one ruble", () => {
    const res = parseMoney("one ruble");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three rubles", () => {
    const res = parseMoney("twenty-three rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand rubles", () => {
    const res = parseMoney("one thousand rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred rubles", () => {
    const res = parseMoney("a hundred rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(100);
  });

  test("parses half million rubles", () => {
    const res = parseMoney("half a million rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter ruble", () => {
    const res = parseMoney("a quarter ruble");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty rubles", () => {
    const res = parseMoney("about fifty rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand rubles", () => {
    const res = parseMoney("around one thousand rubles");
    expect(res.currency).toBe("BYN");
    expect(res.amount).toBe(1000);
  });
});

describe("Bhutanese Ngultrum (BTN)", () => {
  test("parses ngultrum currency name", () => {
    const res = parseMoney("73 ngultrum");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(73);
  });

  test("parses ngultrums plural", () => {
    const res = parseMoney("127 ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(127);
  });

  test("parses BTN ISO code before amount", () => {
    const res = parseMoney("BTN 843");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(843);
  });

  test("parses BTN ISO code after amount", () => {
    const res = parseMoney("1234 BTN");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(1234);
  });

  test("parses BTN with decimal", () => {
    const res = parseMoney("BTN 456.78");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(456.78);
  });

  test("parses ngultrum with decimal", () => {
    const res = parseMoney("99.25 ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Bhutanese Ngultrum with amount in sentence", () => {
    const res = parseMoney("The price is 999 Bhutanese Ngultrum");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number ngultrum", () => {
    const res = parseMoney("five hundred and sixty-seven ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(567);
  });

  test("parses half ngultrum", () => {
    const res = parseMoney("half an ngultrum");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one ngultrum", () => {
    const res = parseMoney("one ngultrum");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three ngultrums", () => {
    const res = parseMoney("twenty-three ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand ngultrums", () => {
    const res = parseMoney("one thousand ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred ngultrums", () => {
    const res = parseMoney("a hundred ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(100);
  });

  test("parses half million ngultrums", () => {
    const res = parseMoney("half a million ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter ngultrum", () => {
    const res = parseMoney("a quarter ngultrum");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty ngultrums", () => {
    const res = parseMoney("about fifty ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand ngultrums", () => {
    const res = parseMoney("around one thousand ngultrums");
    expect(res.currency).toBe("BTN");
    expect(res.amount).toBe(1000);
  });
});

describe("Bosnian Mark (BAM)", () => {
  test("parses mark currency name", () => {
    const res = parseMoney("73 mark");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(73);
  });

  test("parses marks plural", () => {
    const res = parseMoney("127 marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(127);
  });

  test("parses BAM ISO code before amount", () => {
    const res = parseMoney("BAM 843");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(843);
  });

  test("parses BAM ISO code after amount", () => {
    const res = parseMoney("1234 BAM");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(1234);
  });

  test("parses BAM with decimal", () => {
    const res = parseMoney("BAM 456.78");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(456.78);
  });

  test("parses mark with decimal", () => {
    const res = parseMoney("99.25 marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(99.25);
  });

  test("parses Bosnian Mark with amount in sentence", () => {
    const res = parseMoney("The price is 999 Bosnian Mark");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(999);
  });

  test("parses worded number mark", () => {
    const res = parseMoney("five hundred and sixty-seven marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(567);
  });

  test("parses half mark", () => {
    const res = parseMoney("half a mark");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(0.5);
  });

  test("parses one mark", () => {
    const res = parseMoney("one mark");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three marks", () => {
    const res = parseMoney("twenty-three marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand marks", () => {
    const res = parseMoney("one thousand marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred marks", () => {
    const res = parseMoney("a hundred marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(100);
  });

  test("parses half million marks", () => {
    const res = parseMoney("half a million marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter mark", () => {
    const res = parseMoney("a quarter mark");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty marks", () => {
    const res = parseMoney("about fifty marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand marks", () => {
    const res = parseMoney("around one thousand marks");
    expect(res.currency).toBe("BAM");
    expect(res.amount).toBe(1000);
  });
});

describe("Botswana Pula (BWP)", () => {
  test("parses pula currency name", () => {
    const res = parseMoney("73 pula");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(73);
  });

  test("parses pulas plural", () => {
    const res = parseMoney("127 pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(127);
  });

  test("parses BWP ISO code before amount", () => {
    const res = parseMoney("BWP 843");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(843);
  });

  test("parses BWP ISO code after amount", () => {
    const res = parseMoney("1234 BWP");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(1234);
  });

  test("parses BWP with decimal", () => {
    const res = parseMoney("BWP 456.78");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(456.78);
  });

  test("parses pula with decimal", () => {
    const res = parseMoney("99.25 pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(99.25);
  });

  test("parses Botswana Pula with amount in sentence", () => {
    const res = parseMoney("The price is 999 Botswana Pula");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(999);
  });

  test("parses worded number pula", () => {
    const res = parseMoney("five hundred and sixty-seven pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(567);
  });

  test("parses half pula", () => {
    const res = parseMoney("half a pula");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(0.5);
  });

  test("parses one pula", () => {
    const res = parseMoney("one pula");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three pulas", () => {
    const res = parseMoney("twenty-three pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand pulas", () => {
    const res = parseMoney("one thousand pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred pulas", () => {
    const res = parseMoney("a hundred pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(100);
  });

  test("parses half million pulas", () => {
    const res = parseMoney("half a million pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter pula", () => {
    const res = parseMoney("a quarter pula");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty pulas", () => {
    const res = parseMoney("about fifty pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand pulas", () => {
    const res = parseMoney("around one thousand pulas");
    expect(res.currency).toBe("BWP");
    expect(res.amount).toBe(1000);
  });
});

describe("Bulgarian Lev (BGN)", () => {
  test("parses lev currency name", () => {
    const res = parseMoney("73 lev");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(73);
  });

  test("parses leva plural", () => {
    const res = parseMoney("127 leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(127);
  });

  test("parses BGN ISO code before amount", () => {
    const res = parseMoney("BGN 843");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(843);
  });

  test("parses BGN ISO code after amount", () => {
    const res = parseMoney("1234 BGN");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(1234);
  });

  test("parses BGN with decimal", () => {
    const res = parseMoney("BGN 456.78");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(456.78);
  });

  test("parses lev with decimal", () => {
    const res = parseMoney("99.25 leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Bulgarian Lev with amount in sentence", () => {
    const res = parseMoney("The price is 999 Bulgarian Lev");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number lev", () => {
    const res = parseMoney("five hundred and sixty-seven leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(567);
  });

  test("parses half lev", () => {
    const res = parseMoney("half a lev");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one lev", () => {
    const res = parseMoney("one lev");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three leva", () => {
    const res = parseMoney("twenty-three leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand leva", () => {
    const res = parseMoney("one thousand leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred leva", () => {
    const res = parseMoney("a hundred leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(100);
  });

  test("parses half million leva", () => {
    const res = parseMoney("half a million leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter lev", () => {
    const res = parseMoney("a quarter lev");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty leva", () => {
    const res = parseMoney("about fifty leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand leva", () => {
    const res = parseMoney("around one thousand leva");
    expect(res.currency).toBe("BGN");
    expect(res.amount).toBe(1000);
  });
});

describe("Burundian Franc (BIF)", () => {
  test("parses franc currency name", () => {
    const res = parseMoney("73 burundian franc");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(73);
  });

  test("parses francs plural", () => {
    const res = parseMoney("127 burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(127);
  });

  test("parses BIF ISO code before amount", () => {
    const res = parseMoney("BIF 843");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(843);
  });

  test("parses BIF ISO code after amount", () => {
    const res = parseMoney("1234 BIF");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(1234);
  });

  test("parses BIF with decimal", () => {
    const res = parseMoney("BIF 456.78");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(456.78);
  });

  test("parses franc with decimal", () => {
    const res = parseMoney("99.25 burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Burundian Franc with amount in sentence", () => {
    const res = parseMoney("The price is 999 Burundian Franc");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number franc", () => {
    const res = parseMoney("five hundred and sixty-seven burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(567);
  });

  test("parses half franc", () => {
    const res = parseMoney("half a burundian franc");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one franc", () => {
    const res = parseMoney("one burundian franc");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three francs", () => {
    const res = parseMoney("twenty-three burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand francs", () => {
    const res = parseMoney("one thousand burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred francs", () => {
    const res = parseMoney("a hundred burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(100);
  });

  test("parses half million francs", () => {
    const res = parseMoney("half a million burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter franc", () => {
    const res = parseMoney("a quarter burundian franc");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty francs", () => {
    const res = parseMoney("about fifty burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand francs", () => {
    const res = parseMoney("around one thousand burundian francs");
    expect(res.currency).toBe("BIF");
    expect(res.amount).toBe(1000);
  });
});

describe("Cambodian Riel (KHR)", () => {
  test("parses riel currency name", () => {
    const res = parseMoney("73 riel");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(73);
  });

  test("parses riels plural", () => {
    const res = parseMoney("127 riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(127);
  });

  test("parses KHR ISO code before amount", () => {
    const res = parseMoney("KHR 843");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(843);
  });

  test("parses KHR ISO code after amount", () => {
    const res = parseMoney("1234 KHR");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(1234);
  });

  test("parses KHR with decimal", () => {
    const res = parseMoney("KHR 456.78");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(456.78);
  });

  test("parses riel with decimal", () => {
    const res = parseMoney("99.25 riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Cambodian Riel with amount in sentence", () => {
    const res = parseMoney("The price is 999 Cambodian Riel");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number riel", () => {
    const res = parseMoney("five hundred and sixty-seven riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(567);
  });

  test("parses half riel", () => {
    const res = parseMoney("half a riel");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one riel", () => {
    const res = parseMoney("one riel");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three riels", () => {
    const res = parseMoney("twenty-three riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand riels", () => {
    const res = parseMoney("one thousand riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred riels", () => {
    const res = parseMoney("a hundred riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(100);
  });

  test("parses half million riels", () => {
    const res = parseMoney("half a million riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter riel", () => {
    const res = parseMoney("a quarter riel");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty riels", () => {
    const res = parseMoney("about fifty riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand riels", () => {
    const res = parseMoney("around one thousand riels");
    expect(res.currency).toBe("KHR");
    expect(res.amount).toBe(1000);
  });
});

describe("Cape Verdean Escudo (CVE)", () => {
  test("parses escudo currency name", () => {
    const res = parseMoney("73 escudo");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(73);
  });

  test("parses escudos plural", () => {
    const res = parseMoney("127 escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(127);
  });

  test("parses CVE ISO code before amount", () => {
    const res = parseMoney("CVE 843");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(843);
  });

  test("parses CVE ISO code after amount", () => {
    const res = parseMoney("1234 CVE");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(1234);
  });

  test("parses CVE with decimal", () => {
    const res = parseMoney("CVE 456.78");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(456.78);
  });

  test("parses escudo with decimal", () => {
    const res = parseMoney("99.25 escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(99.25);
  });

  test("parses Cape Verdean Escudo with amount in sentence", () => {
    const res = parseMoney("The price is 999 Cape Verdean Escudo");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(999);
  });

  test("parses worded number escudo", () => {
    const res = parseMoney("five hundred and sixty-seven escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(567);
  });

  test("parses half escudo", () => {
    const res = parseMoney("half an escudo");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(0.5);
  });

  test("parses one escudo", () => {
    const res = parseMoney("one escudo");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three escudos", () => {
    const res = parseMoney("twenty-three escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand escudos", () => {
    const res = parseMoney("one thousand escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred escudos", () => {
    const res = parseMoney("a hundred escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(100);
  });

  test("parses half million escudos", () => {
    const res = parseMoney("half a million escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter escudo", () => {
    const res = parseMoney("a quarter escudo");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty escudos", () => {
    const res = parseMoney("about fifty escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand escudos", () => {
    const res = parseMoney("around one thousand escudos");
    expect(res.currency).toBe("CVE");
    expect(res.amount).toBe(1000);
  });
});

describe("Comorian Franc (KMF)", () => {
  test("parses franc currency name", () => {
    const res = parseMoney("73 comorian franc");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(73);
  });

  test("parses francs plural", () => {
    const res = parseMoney("127 comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(127);
  });

  test("parses KMF ISO code before amount", () => {
    const res = parseMoney("KMF 843");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(843);
  });

  test("parses KMF ISO code after amount", () => {
    const res = parseMoney("1234 KMF");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(1234);
  });

  test("parses KMF with decimal", () => {
    const res = parseMoney("KMF 456.78");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(456.78);
  });

  test("parses comorian franc with decimal", () => {
    const res = parseMoney("99.25 comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Comorian Franc with amount in sentence", () => {
    const res = parseMoney("The price is 999 Comorian Franc");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number franc", () => {
    const res = parseMoney("five hundred and sixty-seven comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(567);
  });

  test("parses half franc", () => {
    const res = parseMoney("half a comorian franc");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one franc", () => {
    const res = parseMoney("one comorian franc");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three francs", () => {
    const res = parseMoney("twenty-three comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand francs", () => {
    const res = parseMoney("one thousand comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred francs", () => {
    const res = parseMoney("a hundred comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(100);
  });

  test("parses half million francs", () => {
    const res = parseMoney("half a million comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter franc", () => {
    const res = parseMoney("a quarte comorian franc");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty francs", () => {
    const res = parseMoney("about fifty comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand francs", () => {
    const res = parseMoney("around one thousand comorian francs");
    expect(res.currency).toBe("KMF");
    expect(res.amount).toBe(1000);
  });
});

describe("Congolese Franc (CDF)", () => {
  test("parses franc currency name", () => {
    const res = parseMoney("73 congolese franc");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(73);
  });

  test("parses francs plural", () => {
    const res = parseMoney("127 congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(127);
  });

  test("parses CDF ISO code before amount", () => {
    const res = parseMoney("CDF 843");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(843);
  });

  test("parses CDF ISO code after amount", () => {
    const res = parseMoney("1234 CDF");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(1234);
  });

  test("parses CDF with decimal", () => {
    const res = parseMoney("CDF 456.78");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(456.78);
  });

  test("parses franc with decimal", () => {
    const res = parseMoney("99.25 congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Congolese Franc with amount in sentence", () => {
    const res = parseMoney("The price is 999 Congolese Franc");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number franc", () => {
    const res = parseMoney("five hundred and sixty-seven congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(567);
  });

  test("parses half franc", () => {
    const res = parseMoney("half a congolese franc");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one franc", () => {
    const res = parseMoney("one congolese franc");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three francs", () => {
    const res = parseMoney("twenty-three congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand francs", () => {
    const res = parseMoney("one thousand congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred francs", () => {
    const res = parseMoney("a hundred congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(100);
  });

  test("parses half million francs", () => {
    const res = parseMoney("half a million congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter franc", () => {
    const res = parseMoney("a quarter congolese franc");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty francs", () => {
    const res = parseMoney("about fifty congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand francs", () => {
    const res = parseMoney("around one thousand congolese francs");
    expect(res.currency).toBe("CDF");
    expect(res.amount).toBe(1000);
  });
});

describe("Croatian Kuna (HRK)", () => {
  test("parses kuna currency name", () => {
    const res = parseMoney("73 kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(73);
  });

  test("parses kuna plural", () => {
    const res = parseMoney("127 kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(127);
  });

  test("parses HRK ISO code before amount", () => {
    const res = parseMoney("HRK 843");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(843);
  });

  test("parses HRK ISO code after amount", () => {
    const res = parseMoney("1234 HRK");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(1234);
  });

  test("parses HRK with decimal", () => {
    const res = parseMoney("HRK 456.78");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(456.78);
  });

  test("parses kuna with decimal", () => {
    const res = parseMoney("99.25 kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Croatian Kuna with amount in sentence", () => {
    const res = parseMoney("The price is 999 Croatian Kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number kuna", () => {
    const res = parseMoney("five hundred and sixty-seven kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(567);
  });

  test("parses half kuna", () => {
    const res = parseMoney("half a kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one kuna", () => {
    const res = parseMoney("one kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three kuna", () => {
    const res = parseMoney("twenty-three kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand kuna", () => {
    const res = parseMoney("one thousand kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred kuna", () => {
    const res = parseMoney("a hundred kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(100);
  });

  test("parses half million kuna", () => {
    const res = parseMoney("half a million kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter kuna", () => {
    const res = parseMoney("a quarter kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty kuna", () => {
    const res = parseMoney("about fifty kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand kuna", () => {
    const res = parseMoney("around one thousand kuna");
    expect(res.currency).toBe("HRK");
    expect(res.amount).toBe(1000);
  });
});

describe("Djiboutian Franc (DJF)", () => {
  test("parses franc currency name", () => {
    const res = parseMoney("73 djiboutian franc");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(73);
  });

  test("parses francs plural", () => {
    const res = parseMoney("127 djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(127);
  });

  test("parses DJF ISO code before amount", () => {
    const res = parseMoney("DJF 843");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(843);
  });

  test("parses DJF ISO code after amount", () => {
    const res = parseMoney("1234 DJF");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(1234);
  });

  test("parses DJF with decimal", () => {
    const res = parseMoney("DJF 456.78");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(456.78);
  });

  test("parses franc with decimal", () => {
    const res = parseMoney("99.25 djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Djiboutian Franc with amount in sentence", () => {
    const res = parseMoney("The price is 999 Djiboutian Franc");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number franc", () => {
    const res = parseMoney("five hundred and sixty-seven djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(567);
  });

  test("parses half franc", () => {
    const res = parseMoney("half a djiboutian franc");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one franc", () => {
    const res = parseMoney("one djiboutian franc");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three francs", () => {
    const res = parseMoney("twenty-three djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand francs", () => {
    const res = parseMoney("one thousand djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred francs", () => {
    const res = parseMoney("a hundred djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(100);
  });

  test("parses half million francs", () => {
    const res = parseMoney("half a million djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter franc", () => {
    const res = parseMoney("a quarter djiboutian franc");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty francs", () => {
    const res = parseMoney("about fifty djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand francs", () => {
    const res = parseMoney("around one thousand djiboutian francs");
    expect(res.currency).toBe("DJF");
    expect(res.amount).toBe(1000);
  });
});

describe("Eritrean Nakfa (ERN)", () => {
  test("parses nakfa currency name", () => {
    const res = parseMoney("73 nakfa");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(73);
  });

  test("parses nakfas plural", () => {
    const res = parseMoney("127 nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(127);
  });

  test("parses ERN ISO code before amount", () => {
    const res = parseMoney("ERN 843");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(843);
  });

  test("parses ERN ISO code after amount", () => {
    const res = parseMoney("1234 ERN");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(1234);
  });

  test("parses ERN with decimal", () => {
    const res = parseMoney("ERN 456.78");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(456.78);
  });

  test("parses nakfa with decimal", () => {
    const res = parseMoney("99.25 nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Eritrean Nakfa with amount in sentence", () => {
    const res = parseMoney("The price is 999 Eritrean Nakfa");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number nakfa", () => {
    const res = parseMoney("five hundred and sixty-seven nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(567);
  });

  test("parses half nakfa", () => {
    const res = parseMoney("half a nakfa");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one nakfa", () => {
    const res = parseMoney("one nakfa");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three nakfas", () => {
    const res = parseMoney("twenty-three nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand nakfas", () => {
    const res = parseMoney("one thousand nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred nakfas", () => {
    const res = parseMoney("a hundred nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(100);
  });

  test("parses half million nakfas", () => {
    const res = parseMoney("half a million nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter nakfa", () => {
    const res = parseMoney("a quarter nakfa");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty nakfas", () => {
    const res = parseMoney("about fifty nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand nakfas", () => {
    const res = parseMoney("around one thousand nakfas");
    expect(res.currency).toBe("ERN");
    expect(res.amount).toBe(1000);
  });
});

describe("Ethiopian Birr (ETB)", () => {
  test("parses birr currency name", () => {
    const res = parseMoney("73 birr");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(73);
  });

  test("parses birrs plural", () => {
    const res = parseMoney("127 birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(127);
  });

  test("parses ETB ISO code before amount", () => {
    const res = parseMoney("ETB 843");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(843);
  });

  test("parses ETB ISO code after amount", () => {
    const res = parseMoney("1234 ETB");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(1234);
  });

  test("parses ETB with decimal", () => {
    const res = parseMoney("ETB 456.78");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(456.78);
  });

  test("parses birr with decimal", () => {
    const res = parseMoney("99.25 birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(99.25);
  });

  test("parses Ethiopian Birr with amount in sentence", () => {
    const res = parseMoney("The price is 999 Ethiopian Birr");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(999);
  });

  test("parses worded number birr", () => {
    const res = parseMoney("five hundred and sixty-seven birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(567);
  });

  test("parses half birr", () => {
    const res = parseMoney("half a birr");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(0.5);
  });

  test("parses one birr", () => {
    const res = parseMoney("one birr");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three birrs", () => {
    const res = parseMoney("twenty-three birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand birrs", () => {
    const res = parseMoney("one thousand birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred birrs", () => {
    const res = parseMoney("a hundred birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(100);
  });

  test("parses half million birrs", () => {
    const res = parseMoney("half a million birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter birr", () => {
    const res = parseMoney("a quarter birr");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty birrs", () => {
    const res = parseMoney("about fifty birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand birrs", () => {
    const res = parseMoney("around one thousand birrs");
    expect(res.currency).toBe("ETB");
    expect(res.amount).toBe(1000);
  });
});

describe("Georgian Lari (GEL)", () => {
  test("parses lari currency name", () => {
    const res = parseMoney("73 lari");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(73);
  });

  test("parses larit plural", () => {
    const res = parseMoney("127 larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(127);
  });

  test("parses GEL ISO code before amount", () => {
    const res = parseMoney("GEL 843");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(843);
  });

  test("parses GEL ISO code after amount", () => {
    const res = parseMoney("1234 GEL");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(1234);
  });

  test("parses GEL with decimal", () => {
    const res = parseMoney("GEL 456.78");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(456.78);
  });

  test("parses lari with decimal", () => {
    const res = parseMoney("99.25 larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Georgian Lari with amount in sentence", () => {
    const res = parseMoney("The price is 999 Georgian Lari");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number lari", () => {
    const res = parseMoney("five hundred and sixty-seven larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(567);
  });

  test("parses half lari", () => {
    const res = parseMoney("half a lari");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one lari", () => {
    const res = parseMoney("one lari");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three larit", () => {
    const res = parseMoney("twenty-three larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand larit", () => {
    const res = parseMoney("one thousand larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred larit", () => {
    const res = parseMoney("a hundred larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(100);
  });

  test("parses half million larit", () => {
    const res = parseMoney("half a million larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter lari", () => {
    const res = parseMoney("a quarter lari");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty larit", () => {
    const res = parseMoney("about fifty larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand larit", () => {
    const res = parseMoney("around one thousand larit");
    expect(res.currency).toBe("GEL");
    expect(res.amount).toBe(1000);
  });
});

describe("Gambian Dalasi (GMD)", () => {
  test("parses dalasi currency name", () => {
    const res = parseMoney("73 dalasi");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(73);
  });

  test("parses dalasis plural", () => {
    const res = parseMoney("127 dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(127);
  });

  test("parses GMD ISO code before amount", () => {
    const res = parseMoney("GMD 843");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(843);
  });

  test("parses GMD ISO code after amount", () => {
    const res = parseMoney("1234 GMD");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(1234);
  });

  test("parses GMD with decimal", () => {
    const res = parseMoney("GMD 456.78");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dalasi with decimal", () => {
    const res = parseMoney("99.25 dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Gambian Dalasi with amount in sentence", () => {
    const res = parseMoney("The price is 999 Gambian Dalasi");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dalasi", () => {
    const res = parseMoney("five hundred and sixty-seven dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(567);
  });

  test("parses half dalasi", () => {
    const res = parseMoney("half a dalasi");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dalasi", () => {
    const res = parseMoney("one dalasi");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dalasis", () => {
    const res = parseMoney("twenty-three dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dalasis", () => {
    const res = parseMoney("one thousand dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dalasis", () => {
    const res = parseMoney("a hundred dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dalasis", () => {
    const res = parseMoney("half a million dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dalasi", () => {
    const res = parseMoney("a quarter dalasi");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dalasis", () => {
    const res = parseMoney("about fifty dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dalasis", () => {
    const res = parseMoney("around one thousand dalasis");
    expect(res.currency).toBe("GMD");
    expect(res.amount).toBe(1000);
  });
});

describe("Guinean Franc (GNF)", () => {
  test("parses franc currency name", () => {
    const res = parseMoney("73 guinean franc");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(73);
  });

  test("parses francs plural", () => {
    const res = parseMoney("127 guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(127);
  });

  test("parses GNF ISO code before amount", () => {
    const res = parseMoney("GNF 843");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(843);
  });

  test("parses GNF ISO code after amount", () => {
    const res = parseMoney("1234 GNF");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(1234);
  });

  test("parses GNF with decimal", () => {
    const res = parseMoney("GNF 456.78");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(456.78);
  });

  test("parses franc with decimal", () => {
    const res = parseMoney("99.25 guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Guinean Franc with amount in sentence", () => {
    const res = parseMoney("The price is 999 Guinean Franc");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number franc", () => {
    const res = parseMoney("five hundred and sixty-seven guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(567);
  });

  test("parses half franc", () => {
    const res = parseMoney("half a guinean franc");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one franc", () => {
    const res = parseMoney("one guinean franc");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three francs", () => {
    const res = parseMoney("twenty-three guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand francs", () => {
    const res = parseMoney("one thousand guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred francs", () => {
    const res = parseMoney("a hundred guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(100);
  });

  test("parses half million francs", () => {
    const res = parseMoney("half a million guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter franc", () => {
    const res = parseMoney("a quarter guinean franc");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty francs", () => {
    const res = parseMoney("about fifty guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand francs", () => {
    const res = parseMoney("around one thousand guinean francs");
    expect(res.currency).toBe("GNF");
    expect(res.amount).toBe(1000);
  });
});

describe("Haitian Gourde (HTG)", () => {
  test("parses gourde currency name", () => {
    const res = parseMoney("73 gourde");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(73);
  });

  test("parses gourdos plural", () => {
    const res = parseMoney("127 gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(127);
  });

  test("parses HTG ISO code before amount", () => {
    const res = parseMoney("HTG 843");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(843);
  });

  test("parses HTG ISO code after amount", () => {
    const res = parseMoney("1234 HTG");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(1234);
  });

  test("parses HTG with decimal", () => {
    const res = parseMoney("HTG 456.78");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(456.78);
  });

  test("parses gourde with decimal", () => {
    const res = parseMoney("99.25 gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(99.25);
  });

  test("parses Haitian Gourde with amount in sentence", () => {
    const res = parseMoney("The price is 999 Haitian Gourde");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(999);
  });

  test("parses worded number gourde", () => {
    const res = parseMoney("five hundred and sixty-seven gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(567);
  });

  test("parses half gourde", () => {
    const res = parseMoney("half a gourde");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(0.5);
  });

  test("parses one gourde", () => {
    const res = parseMoney("one gourde");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three gourdos", () => {
    const res = parseMoney("twenty-three gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand gourdos", () => {
    const res = parseMoney("one thousand gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred gourdos", () => {
    const res = parseMoney("a hundred gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(100);
  });

  test("parses half million gourdos", () => {
    const res = parseMoney("half a million gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter gourde", () => {
    const res = parseMoney("a quarter gourde");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty gourdos", () => {
    const res = parseMoney("about fifty gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand gourdos", () => {
    const res = parseMoney("around one thousand gourdos");
    expect(res.currency).toBe("HTG");
    expect(res.amount).toBe(1000);
  });
});

describe("Honduran Lempira (HNL)", () => {
  test("parses lempira currency name", () => {
    const res = parseMoney("73 lempira");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(73);
  });

  test("parses lempiras plural", () => {
    const res = parseMoney("127 lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(127);
  });

  test("parses HNL ISO code before amount", () => {
    const res = parseMoney("HNL 843");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(843);
  });

  test("parses HNL ISO code after amount", () => {
    const res = parseMoney("1234 HNL");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(1234);
  });

  test("parses HNL with decimal", () => {
    const res = parseMoney("HNL 456.78");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(456.78);
  });

  test("parses lempira with decimal", () => {
    const res = parseMoney("99.25 lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Honduran Lempira with amount in sentence", () => {
    const res = parseMoney("The price is 999 Honduran Lempira");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number lempira", () => {
    const res = parseMoney("five hundred and sixty-seven lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(567);
  });

  test("parses half lempira", () => {
    const res = parseMoney("half a lempira");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one lempira", () => {
    const res = parseMoney("one lempira");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three lempiras", () => {
    const res = parseMoney("twenty-three lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand lempiras", () => {
    const res = parseMoney("one thousand lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred lempiras", () => {
    const res = parseMoney("a hundred lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(100);
  });

  test("parses half million lempiras", () => {
    const res = parseMoney("half a million lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter lempira", () => {
    const res = parseMoney("a quarter lempira");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty lempiras", () => {
    const res = parseMoney("about fifty lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand lempiras", () => {
    const res = parseMoney("around one thousand lempiras");
    expect(res.currency).toBe("HNL");
    expect(res.amount).toBe(1000);
  });
});

describe("Hungarian Forint (HUF)", () => {
  test("parses forint currency name", () => {
    const res = parseMoney("73 forint");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(73);
  });

  test("parses forints plural", () => {
    const res = parseMoney("127 forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(127);
  });

  test("parses HUF ISO code before amount", () => {
    const res = parseMoney("HUF 843");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(843);
  });

  test("parses HUF ISO code after amount", () => {
    const res = parseMoney("1234 HUF");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(1234);
  });

  test("parses HUF with decimal", () => {
    const res = parseMoney("HUF 456.78");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(456.78);
  });

  test("parses forint with decimal", () => {
    const res = parseMoney("99.25 forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Hungarian Forint with amount in sentence", () => {
    const res = parseMoney("The price is 999 Hungarian Forint");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number forint", () => {
    const res = parseMoney("five hundred and sixty-seven forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(567);
  });

  test("parses half forint", () => {
    const res = parseMoney("half a forint");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one forint", () => {
    const res = parseMoney("one forint");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three forints", () => {
    const res = parseMoney("twenty-three forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand forints", () => {
    const res = parseMoney("one thousand forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred forints", () => {
    const res = parseMoney("a hundred forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(100);
  });

  test("parses half million forints", () => {
    const res = parseMoney("half a million forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter forint", () => {
    const res = parseMoney("a quarter forint");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty forints", () => {
    const res = parseMoney("about fifty forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand forints", () => {
    const res = parseMoney("around one thousand forints");
    expect(res.currency).toBe("HUF");
    expect(res.amount).toBe(1000);
  });
});

describe("Icelandic Króna (ISK)", () => {
  test("parses króna currency name", () => {
    const res = parseMoney("73 króna");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(73);
  });

  test("parses krónur plural", () => {
    const res = parseMoney("127 krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(127);
  });

  test("parses ISK ISO code before amount", () => {
    const res = parseMoney("ISK 843");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(843);
  });

  test("parses ISK ISO code after amount", () => {
    const res = parseMoney("1234 ISK");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(1234);
  });

  test("parses ISK with decimal", () => {
    const res = parseMoney("ISK 456.78");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(456.78);
  });

  test("parses króna with decimal", () => {
    const res = parseMoney("99.25 krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Icelandic Króna with amount in sentence", () => {
    const res = parseMoney("The price is 999 Icelandic Króna");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number króna", () => {
    const res = parseMoney("five hundred and sixty-seven krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(567);
  });

  test("parses half króna", () => {
    const res = parseMoney("half a króna");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one króna", () => {
    const res = parseMoney("one króna");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three krónur", () => {
    const res = parseMoney("twenty-three krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand krónur", () => {
    const res = parseMoney("one thousand krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred krónur", () => {
    const res = parseMoney("a hundred krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(100);
  });

  test("parses half million krónur", () => {
    const res = parseMoney("half a million krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter króna", () => {
    const res = parseMoney("a quarter króna");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty krónur", () => {
    const res = parseMoney("about fifty krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand krónur", () => {
    const res = parseMoney("around one thousand krónur");
    expect(res.currency).toBe("ISK");
    expect(res.amount).toBe(1000);
  });
});

describe("Iraqi Dinar (IQD)", () => {
  test("parses dinar currency name", () => {
    const res = parseMoney("73 iraqi dinar");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(73);
  });

  test("parses dinars plural", () => {
    const res = parseMoney("127 iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(127);
  });

  test("parses IQD ISO code before amount", () => {
    const res = parseMoney("IQD 843");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(843);
  });

  test("parses IQD ISO code after amount", () => {
    const res = parseMoney("1234 IQD");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(1234);
  });

  test("parses IQD with decimal", () => {
    const res = parseMoney("IQD 456.78");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dinar with decimal", () => {
    const res = parseMoney("99.25 iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Iraqi Dinar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Iraqi Dinar");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dinar", () => {
    const res = parseMoney("five hundred and sixty-seven iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(567);
  });

  test("parses half dinar", () => {
    const res = parseMoney("half a iraqi dinar");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dinar", () => {
    const res = parseMoney("one iraqi dinar");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dinars", () => {
    const res = parseMoney("twenty-three iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dinars", () => {
    const res = parseMoney("one thousand iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dinars", () => {
    const res = parseMoney("a hundred iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dinars", () => {
    const res = parseMoney("half a million iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dinar", () => {
    const res = parseMoney("a quarter iraqi dinar");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dinars", () => {
    const res = parseMoney("about fifty iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dinars", () => {
    const res = parseMoney("around one thousand iraqi dinars");
    expect(res.currency).toBe("IQD");
    expect(res.amount).toBe(1000);
  });
});

describe("Jamaican Dollar (JMD)", () => {
  test("parses dollar currency name", () => {
    const res = parseMoney("73 jamaican dollar");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(73);
  });

  test("parses dollars plural", () => {
    const res = parseMoney("127 jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(127);
  });

  test("parses JMD ISO code before amount", () => {
    const res = parseMoney("JMD 843");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(843);
  });

  test("parses JMD ISO code after amount", () => {
    const res = parseMoney("1234 JMD");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(1234);
  });

  test("parses JMD with decimal", () => {
    const res = parseMoney("JMD 456.78");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dollar with decimal", () => {
    const res = parseMoney("99.25 jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Jamaican Dollar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Jamaican Dollar");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dollar", () => {
    const res = parseMoney("five hundred and sixty-seven jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(567);
  });

  test("parses half dollar", () => {
    const res = parseMoney("half a jamaican dollar");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dollar", () => {
    const res = parseMoney("one jamaican dollar");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dollars", () => {
    const res = parseMoney("twenty-three jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dollars", () => {
    const res = parseMoney("one thousand jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dollars", () => {
    const res = parseMoney("a hundred jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dollars", () => {
    const res = parseMoney("half a million jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dollar", () => {
    const res = parseMoney("a quarter jamaican  dollar");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dollars", () => {
    const res = parseMoney("about fifty jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dollars", () => {
    const res = parseMoney("around one thousand jamaican dollars");
    expect(res.currency).toBe("JMD");
    expect(res.amount).toBe(1000);
  });
});

describe("Jordanian Dinar (JOD)", () => {
  test("parses dinar currency name", () => {
    const res = parseMoney("73 jordanian dinar");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(73);
  });

  test("parses dinars plural", () => {
    const res = parseMoney("127 jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(127);
  });

  test("parses JOD ISO code before amount", () => {
    const res = parseMoney("JOD 843");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(843);
  });

  test("parses JOD ISO code after amount", () => {
    const res = parseMoney("1234 JOD");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(1234);
  });

  test("parses JOD with decimal", () => {
    const res = parseMoney("JOD 456.78");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dinar with decimal", () => {
    const res = parseMoney("99.25 jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Jordanian Dinar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Jordanian Dinar");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dinar", () => {
    const res = parseMoney("five hundred and sixty-seven jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(567);
  });

  test("parses half dinar", () => {
    const res = parseMoney("half a jordanian dinar");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dinar", () => {
    const res = parseMoney("one jordanian dinar");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dinars", () => {
    const res = parseMoney("twenty-three jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dinars", () => {
    const res = parseMoney("one thousand jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dinars", () => {
    const res = parseMoney("a hundred jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dinars", () => {
    const res = parseMoney("half a million jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dinar", () => {
    const res = parseMoney("a quarter jordanian dinar");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dinars", () => {
    const res = parseMoney("about fifty jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dinars", () => {
    const res = parseMoney("around one thousand jordanian dinars");
    expect(res.currency).toBe("JOD");
    expect(res.amount).toBe(1000);
  });
});

describe("Kazakhstani Tenge (KZT)", () => {
  test("parses tenge currency name", () => {
    const res = parseMoney("73 tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(73);
  });

  test("parses tenge plural", () => {
    const res = parseMoney("127 tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(127);
  });

  test("parses KZT ISO code before amount", () => {
    const res = parseMoney("KZT 843");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(843);
  });

  test("parses KZT ISO code after amount", () => {
    const res = parseMoney("1234 KZT");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(1234);
  });

  test("parses KZT with decimal", () => {
    const res = parseMoney("KZT 456.78");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(456.78);
  });

  test("parses tenge with decimal", () => {
    const res = parseMoney("99.25 tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(99.25);
  });

  test("parses Kazakhstani Tenge with amount in sentence", () => {
    const res = parseMoney("The price is 999 Kazakhstani Tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(999);
  });

  test("parses worded number tenge", () => {
    const res = parseMoney("five hundred and sixty-seven tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(567);
  });

  test("parses half tenge", () => {
    const res = parseMoney("half a tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(0.5);
  });

  test("parses one tenge", () => {
    const res = parseMoney("one tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three tenge", () => {
    const res = parseMoney("twenty-three tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand tenge", () => {
    const res = parseMoney("one thousand tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred tenge", () => {
    const res = parseMoney("a hundred tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(100);
  });

  test("parses half million tenge", () => {
    const res = parseMoney("half a million tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter tenge", () => {
    const res = parseMoney("a quarter tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty tenge", () => {
    const res = parseMoney("about fifty tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand tenge", () => {
    const res = parseMoney("around one thousand tenge");
    expect(res.currency).toBe("KZT");
    expect(res.amount).toBe(1000);
  });
});

describe("Kenyan Shilling (KES)", () => {
  test("parses shilling currency name", () => {
    const res = parseMoney("73 shilling");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(73);
  });

  test("parses shillings plural", () => {
    const res = parseMoney("127 shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(127);
  });

  test("parses KES ISO code before amount", () => {
    const res = parseMoney("KES 843");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(843);
  });

  test("parses KES ISO code after amount", () => {
    const res = parseMoney("1234 KES");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(1234);
  });

  test("parses KES with decimal", () => {
    const res = parseMoney("KES 456.78");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(456.78);
  });

  test("parses shilling with decimal", () => {
    const res = parseMoney("99.25 shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(99.25);
  });

  test("parses Kenyan Shilling with amount in sentence", () => {
    const res = parseMoney("The price is 999 Kenyan Shilling");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(999);
  });

  test("parses worded number shilling", () => {
    const res = parseMoney("five hundred and sixty-seven shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(567);
  });

  test("parses half shilling", () => {
    const res = parseMoney("half a shilling");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(0.5);
  });

  test("parses one shilling", () => {
    const res = parseMoney("one shilling");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three shillings", () => {
    const res = parseMoney("twenty-three shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand shillings", () => {
    const res = parseMoney("one thousand shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred shillings", () => {
    const res = parseMoney("a hundred shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(100);
  });

  test("parses half million shillings", () => {
    const res = parseMoney("half a million shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter shilling", () => {
    const res = parseMoney("a quarter shilling");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty shillings", () => {
    const res = parseMoney("about fifty shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand shillings", () => {
    const res = parseMoney("around one thousand shillings");
    expect(res.currency).toBe("KES");
    expect(res.amount).toBe(1000);
  });
});

describe("Kyrgyzstani Som (KGS)", () => {
  test("parses som currency name", () => {
    const res = parseMoney("73 som");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(73);
  });

  test("parses soms plural", () => {
    const res = parseMoney("127 soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(127);
  });

  test("parses KGS ISO code before amount", () => {
    const res = parseMoney("KGS 843");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(843);
  });

  test("parses KGS ISO code after amount", () => {
    const res = parseMoney("1234 KGS");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(1234);
  });

  test("parses KGS with decimal", () => {
    const res = parseMoney("KGS 456.78");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(456.78);
  });

  test("parses som with decimal", () => {
    const res = parseMoney("99.25 soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(99.25);
  });

  test("parses Kyrgyzstani Som with amount in sentence", () => {
    const res = parseMoney("The price is 999 Kyrgyzstani Som");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(999);
  });

  test("parses worded number som", () => {
    const res = parseMoney("five hundred and sixty-seven soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(567);
  });

  test("parses half som", () => {
    const res = parseMoney("half a som");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(0.5);
  });

  test("parses one som", () => {
    const res = parseMoney("one som");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three soms", () => {
    const res = parseMoney("twenty-three soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand soms", () => {
    const res = parseMoney("one thousand soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred soms", () => {
    const res = parseMoney("a hundred soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(100);
  });

  test("parses half million soms", () => {
    const res = parseMoney("half a million soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter som", () => {
    const res = parseMoney("a quarter som");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty soms", () => {
    const res = parseMoney("about fifty soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand soms", () => {
    const res = parseMoney("around one thousand soms");
    expect(res.currency).toBe("KGS");
    expect(res.amount).toBe(1000);
  });
});

describe("Lao Kip (LAK)", () => {
  test("parses kip currency name", () => {
    const res = parseMoney("73 kip");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(73);
  });

  test("parses kips plural", () => {
    const res = parseMoney("127 kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(127);
  });

  test("parses LAK ISO code before amount", () => {
    const res = parseMoney("LAK 843");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(843);
  });

  test("parses LAK ISO code after amount", () => {
    const res = parseMoney("1234 LAK");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(1234);
  });

  test("parses LAK with decimal", () => {
    const res = parseMoney("LAK 456.78");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(456.78);
  });

  test("parses kip with decimal", () => {
    const res = parseMoney("99.25 kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Lao Kip with amount in sentence", () => {
    const res = parseMoney("The price is 999 Lao Kip");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number kip", () => {
    const res = parseMoney("five hundred and sixty-seven kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(567);
  });

  test("parses half kip", () => {
    const res = parseMoney("half a kip");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one kip", () => {
    const res = parseMoney("one kip");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three kips", () => {
    const res = parseMoney("twenty-three kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand kips", () => {
    const res = parseMoney("one thousand kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred kips", () => {
    const res = parseMoney("a hundred kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(100);
  });

  test("parses half million kips", () => {
    const res = parseMoney("half a million kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter kip", () => {
    const res = parseMoney("a quarter kip");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty kips", () => {
    const res = parseMoney("about fifty kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand kips", () => {
    const res = parseMoney("around one thousand kips");
    expect(res.currency).toBe("LAK");
    expect(res.amount).toBe(1000);
  });
});

describe("Lesotho Loti (LSL)", () => {
  test("parses loti currency name", () => {
    const res = parseMoney("73 loti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(73);
  });

  test("parses maloti plural", () => {
    const res = parseMoney("127 maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(127);
  });

  test("parses LSL ISO code before amount", () => {
    const res = parseMoney("LSL 843");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(843);
  });

  test("parses LSL ISO code after amount", () => {
    const res = parseMoney("1234 LSL");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(1234);
  });

  test("parses LSL with decimal", () => {
    const res = parseMoney("LSL 456.78");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(456.78);
  });

  test("parses loti with decimal", () => {
    const res = parseMoney("99.25 maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Lesotho Loti with amount in sentence", () => {
    const res = parseMoney("The price is 999 Lesotho Loti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number loti", () => {
    const res = parseMoney("five hundred and sixty-seven maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(567);
  });

  test("parses half loti", () => {
    const res = parseMoney("half a loti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one loti", () => {
    const res = parseMoney("one loti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three maloti", () => {
    const res = parseMoney("twenty-three maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand maloti", () => {
    const res = parseMoney("one thousand maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred maloti", () => {
    const res = parseMoney("a hundred maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(100);
  });

  test("parses half million maloti", () => {
    const res = parseMoney("half a million maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter loti", () => {
    const res = parseMoney("a quarter loti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty maloti", () => {
    const res = parseMoney("about fifty maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand maloti", () => {
    const res = parseMoney("around one thousand maloti");
    expect(res.currency).toBe("LSL");
    expect(res.amount).toBe(1000);
  });
});

describe("Liberian Dollar (LRD)", () => {
  test("parses dollar currency name", () => {
    const res = parseMoney("73 dollar");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(73);
  });

  test("parses dollars plural", () => {
    const res = parseMoney("127 dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(127);
  });

  test("parses LRD ISO code before amount", () => {
    const res = parseMoney("LRD 843");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(843);
  });

  test("parses LRD ISO code after amount", () => {
    const res = parseMoney("1234 LRD");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(1234);
  });

  test("parses LRD with decimal", () => {
    const res = parseMoney("LRD 456.78");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dollar with decimal", () => {
    const res = parseMoney("99.25 dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Liberian Dollar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Liberian Dollar");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dollar", () => {
    const res = parseMoney("five hundred and sixty-seven dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(567);
  });

  test("parses half dollar", () => {
    const res = parseMoney("half a dollar");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dollar", () => {
    const res = parseMoney("one dollar");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dollars", () => {
    const res = parseMoney("twenty-three dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dollars", () => {
    const res = parseMoney("one thousand dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dollars", () => {
    const res = parseMoney("a hundred dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dollars", () => {
    const res = parseMoney("half a million dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dollar", () => {
    const res = parseMoney("a quarter dollar");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dollars", () => {
    const res = parseMoney("about fifty dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dollars", () => {
    const res = parseMoney("around one thousand dollars");
    expect(res.currency).toBe("LRD");
    expect(res.amount).toBe(1000);
  });
});

describe("Libyan Dinar (LYD)", () => {
  test("parses dinar currency name", () => {
    const res = parseMoney("73 dinar");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(73);
  });

  test("parses dinars plural", () => {
    const res = parseMoney("127 dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(127);
  });

  test("parses LYD ISO code before amount", () => {
    const res = parseMoney("LYD 843");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(843);
  });

  test("parses LYD ISO code after amount", () => {
    const res = parseMoney("1234 LYD");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(1234);
  });

  test("parses LYD with decimal", () => {
    const res = parseMoney("LYD 456.78");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dinar with decimal", () => {
    const res = parseMoney("99.25 dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Libyan Dinar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Libyan Dinar");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dinar", () => {
    const res = parseMoney("five hundred and sixty-seven dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(567);
  });

  test("parses half dinar", () => {
    const res = parseMoney("half a dinar");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dinar", () => {
    const res = parseMoney("one dinar");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dinars", () => {
    const res = parseMoney("twenty-three dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dinars", () => {
    const res = parseMoney("one thousand dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dinars", () => {
    const res = parseMoney("a hundred dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dinars", () => {
    const res = parseMoney("half a million dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dinar", () => {
    const res = parseMoney("a quarter dinar");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dinars", () => {
    const res = parseMoney("about fifty dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dinars", () => {
    const res = parseMoney("around one thousand dinars");
    expect(res.currency).toBe("LYD");
    expect(res.amount).toBe(1000);
  });
});

describe("Malagasy Ariary (MGA)", () => {
  test("parses ariary currency name", () => {
    const res = parseMoney("73 ariary");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(73);
  });

  test("parses ariarys plural", () => {
    const res = parseMoney("127 ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(127);
  });

  test("parses MGA ISO code before amount", () => {
    const res = parseMoney("MGA 843");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(843);
  });

  test("parses MGA ISO code after amount", () => {
    const res = parseMoney("1234 MGA");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(1234);
  });

  test("parses MGA with decimal", () => {
    const res = parseMoney("MGA 456.78");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(456.78);
  });

  test("parses ariary with decimal", () => {
    const res = parseMoney("99.25 ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(99.25);
  });

  test("parses Malagasy Ariary with amount in sentence", () => {
    const res = parseMoney("The price is 999 Malagasy Ariary");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(999);
  });

  test("parses worded number ariary", () => {
    const res = parseMoney("five hundred and sixty-seven ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(567);
  });

  test("parses half ariary", () => {
    const res = parseMoney("half an ariary");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(0.5);
  });

  test("parses one ariary", () => {
    const res = parseMoney("one ariary");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three ariarys", () => {
    const res = parseMoney("twenty-three ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand ariarys", () => {
    const res = parseMoney("one thousand ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred ariarys", () => {
    const res = parseMoney("a hundred ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(100);
  });

  test("parses half million ariarys", () => {
    const res = parseMoney("half a million ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter ariary", () => {
    const res = parseMoney("a quarter ariary");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty ariarys", () => {
    const res = parseMoney("about fifty ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand ariarys", () => {
    const res = parseMoney("around one thousand ariarys");
    expect(res.currency).toBe("MGA");
    expect(res.amount).toBe(1000);
  });
});

describe("Malawian Kwacha (MWK)", () => {
  test("parses kwacha currency name", () => {
    const res = parseMoney("73 kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(73);
  });

  test("parses kwacha plural", () => {
    const res = parseMoney("127 kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(127);
  });

  test("parses MWK ISO code before amount", () => {
    const res = parseMoney("MWK 843");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(843);
  });

  test("parses MWK ISO code after amount", () => {
    const res = parseMoney("1234 MWK");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(1234);
  });

  test("parses MWK with decimal", () => {
    const res = parseMoney("MWK 456.78");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(456.78);
  });

  test("parses kwacha with decimal", () => {
    const res = parseMoney("99.25 kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Malawian Kwacha with amount in sentence", () => {
    const res = parseMoney("The price is 999 Malawian Kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number kwacha", () => {
    const res = parseMoney("five hundred and sixty-seven kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(567);
  });

  test("parses half kwacha", () => {
    const res = parseMoney("half a kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one kwacha", () => {
    const res = parseMoney("one kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three kwacha", () => {
    const res = parseMoney("twenty-three kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand kwacha", () => {
    const res = parseMoney("one thousand kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred kwacha", () => {
    const res = parseMoney("a hundred kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(100);
  });

  test("parses half million kwacha", () => {
    const res = parseMoney("half a million kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter kwacha", () => {
    const res = parseMoney("a quarter kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty kwacha", () => {
    const res = parseMoney("about fifty kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand kwacha", () => {
    const res = parseMoney("around one thousand kwacha");
    expect(res.currency).toBe("MWK");
    expect(res.amount).toBe(1000);
  });
});

describe("Mauritanian Ouguiya (MRU)", () => {
  test("parses ouguiya currency name", () => {
    const res = parseMoney("73 ouguiya");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(73);
  });

  test("parses ouguiyas plural", () => {
    const res = parseMoney("127 ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(127);
  });

  test("parses MRU ISO code before amount", () => {
    const res = parseMoney("MRU 843");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(843);
  });

  test("parses MRU ISO code after amount", () => {
    const res = parseMoney("1234 MRU");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(1234);
  });

  test("parses MRU with decimal", () => {
    const res = parseMoney("MRU 456.78");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(456.78);
  });

  test("parses ouguiya with decimal", () => {
    const res = parseMoney("99.25 ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(99.25);
  });

  test("parses Mauritanian Ouguiya with amount in sentence", () => {
    const res = parseMoney("The price is 999 Mauritanian Ouguiya");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(999);
  });

  test("parses worded number ouguiya", () => {
    const res = parseMoney("five hundred and sixty-seven ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(567);
  });

  test("parses half ouguiya", () => {
    const res = parseMoney("half an ouguiya");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(0.5);
  });

  test("parses one ouguiya", () => {
    const res = parseMoney("one ouguiya");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three ouguiyas", () => {
    const res = parseMoney("twenty-three ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand ouguiyas", () => {
    const res = parseMoney("one thousand ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred ouguiyas", () => {
    const res = parseMoney("a hundred ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(100);
  });

  test("parses half million ouguiyas", () => {
    const res = parseMoney("half a million ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter ouguiya", () => {
    const res = parseMoney("a quarter ouguiya");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty ouguiyas", () => {
    const res = parseMoney("about fifty ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand ouguiyas", () => {
    const res = parseMoney("around one thousand ouguiyas");
    expect(res.currency).toBe("MRU");
    expect(res.amount).toBe(1000);
  });
});

describe("Moldovan Leu (MDL)", () => {
  test("parses leu currency name", () => {
    const res = parseMoney("73 leu");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(73);
  });

  test("parses lei plural", () => {
    const res = parseMoney("127 lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(127);
  });

  test("parses MDL ISO code before amount", () => {
    const res = parseMoney("MDL 843");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(843);
  });

  test("parses MDL ISO code after amount", () => {
    const res = parseMoney("1234 MDL");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(1234);
  });

  test("parses MDL with decimal", () => {
    const res = parseMoney("MDL 456.78");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(456.78);
  });

  test("parses leu with decimal", () => {
    const res = parseMoney("99.25 lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Moldovan Leu with amount in sentence", () => {
    const res = parseMoney("The price is 999 Moldovan Leu");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number leu", () => {
    const res = parseMoney("five hundred and sixty-seven lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(567);
  });

  test("parses half leu", () => {
    const res = parseMoney("half a leu");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one leu", () => {
    const res = parseMoney("one leu");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three lei", () => {
    const res = parseMoney("twenty-three lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand lei", () => {
    const res = parseMoney("one thousand lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred lei", () => {
    const res = parseMoney("a hundred lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(100);
  });

  test("parses half million lei", () => {
    const res = parseMoney("half a million lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter leu", () => {
    const res = parseMoney("a quarter leu");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty lei", () => {
    const res = parseMoney("about fifty lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand lei", () => {
    const res = parseMoney("around one thousand lei");
    expect(res.currency).toBe("MDL");
    expect(res.amount).toBe(1000);
  });
});

describe("Mongolian Tugrik (MNT)", () => {
  test("parses tugrik currency name", () => {
    const res = parseMoney("73 tugrik");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(73);
  });

  test("parses tugriks plural", () => {
    const res = parseMoney("127 tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(127);
  });

  test("parses MNT ISO code before amount", () => {
    const res = parseMoney("MNT 843");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(843);
  });

  test("parses MNT ISO code after amount", () => {
    const res = parseMoney("1234 MNT");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(1234);
  });

  test("parses MNT with decimal", () => {
    const res = parseMoney("MNT 456.78");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(456.78);
  });

  test("parses tugrik with decimal", () => {
    const res = parseMoney("99.25 tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(99.25);
  });

  test("parses Mongolian Tugrik with amount in sentence", () => {
    const res = parseMoney("The price is 999 Mongolian Tugrik");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(999);
  });

  test("parses worded number tugrik", () => {
    const res = parseMoney("five hundred and sixty-seven tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(567);
  });

  test("parses half tugrik", () => {
    const res = parseMoney("half a tugrik");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(0.5);
  });

  test("parses one tugrik", () => {
    const res = parseMoney("one tugrik");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three tugriks", () => {
    const res = parseMoney("twenty-three tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand tugriks", () => {
    const res = parseMoney("one thousand tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred tugriks", () => {
    const res = parseMoney("a hundred tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(100);
  });

  test("parses half million tugriks", () => {
    const res = parseMoney("half a million tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter tugrik", () => {
    const res = parseMoney("a quarter tugrik");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty tugriks", () => {
    const res = parseMoney("about fifty tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand tugriks", () => {
    const res = parseMoney("around one thousand tugriks");
    expect(res.currency).toBe("MNT");
    expect(res.amount).toBe(1000);
  });
});

describe("Moroccan Dirham (MAD)", () => {
  test("parses dirham currency name", () => {
    const res = parseMoney("73 dirham");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(73);
  });

  test("parses dirhams plural", () => {
    const res = parseMoney("127 dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(127);
  });

  test("parses MAD ISO code before amount", () => {
    const res = parseMoney("MAD 843");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(843);
  });

  test("parses MAD ISO code after amount", () => {
    const res = parseMoney("1234 MAD");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(1234);
  });

  test("parses MAD with decimal", () => {
    const res = parseMoney("MAD 456.78");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dirham with decimal", () => {
    const res = parseMoney("99.25 dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Moroccan Dirham with amount in sentence", () => {
    const res = parseMoney("The price is 999 Moroccan Dirham");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dirham", () => {
    const res = parseMoney("five hundred and sixty-seven dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(567);
  });

  test("parses half dirham", () => {
    const res = parseMoney("half a dirham");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dirham", () => {
    const res = parseMoney("one dirham");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dirhams", () => {
    const res = parseMoney("twenty-three dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dirhams", () => {
    const res = parseMoney("one thousand dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dirhams", () => {
    const res = parseMoney("a hundred dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dirhams", () => {
    const res = parseMoney("half a million dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dirham", () => {
    const res = parseMoney("a quarter dirham");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dirhams", () => {
    const res = parseMoney("about fifty dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dirhams", () => {
    const res = parseMoney("around one thousand dirhams");
    expect(res.currency).toBe("MAD");
    expect(res.amount).toBe(1000);
  });
});

describe("Mozambican Metical (MZN)", () => {
  test("parses metical currency name", () => {
    const res = parseMoney("73 metical");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(73);
  });

  test("parses meticais plural", () => {
    const res = parseMoney("127 meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(127);
  });

  test("parses MZN ISO code before amount", () => {
    const res = parseMoney("MZN 843");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(843);
  });

  test("parses MZN ISO code after amount", () => {
    const res = parseMoney("1234 MZN");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(1234);
  });

  test("parses MZN with decimal", () => {
    const res = parseMoney("MZN 456.78");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(456.78);
  });

  test("parses metical with decimal", () => {
    const res = parseMoney("99.25 meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Mozambican Metical with amount in sentence", () => {
    const res = parseMoney("The price is 999 Mozambican Metical");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number metical", () => {
    const res = parseMoney("five hundred and sixty-seven meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(567);
  });

  test("parses half metical", () => {
    const res = parseMoney("half a metical");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one metical", () => {
    const res = parseMoney("one metical");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three meticais", () => {
    const res = parseMoney("twenty-three meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand meticais", () => {
    const res = parseMoney("one thousand meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred meticais", () => {
    const res = parseMoney("a hundred meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(100);
  });

  test("parses half million meticais", () => {
    const res = parseMoney("half a million meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter metical", () => {
    const res = parseMoney("a quarter metical");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty meticais", () => {
    const res = parseMoney("about fifty meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand meticais", () => {
    const res = parseMoney("around one thousand meticais");
    expect(res.currency).toBe("MZN");
    expect(res.amount).toBe(1000);
  });
});

describe("Myanmar Kyat (MMK)", () => {
  test("parses kyat currency name", () => {
    const res = parseMoney("73 kyat");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(73);
  });

  test("parses kyats plural", () => {
    const res = parseMoney("127 kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(127);
  });

  test("parses MMK ISO code before amount", () => {
    const res = parseMoney("MMK 843");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(843);
  });

  test("parses MMK ISO code after amount", () => {
    const res = parseMoney("1234 MMK");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(1234);
  });

  test("parses MMK with decimal", () => {
    const res = parseMoney("MMK 456.78");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(456.78);
  });

  test("parses kyat with decimal", () => {
    const res = parseMoney("99.25 kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Myanmar Kyat with amount in sentence", () => {
    const res = parseMoney("The price is 999 Myanmar Kyat");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number kyat", () => {
    const res = parseMoney("five hundred and sixty-seven kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(567);
  });

  test("parses half kyat", () => {
    const res = parseMoney("half a kyat");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one kyat", () => {
    const res = parseMoney("one kyat");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three kyats", () => {
    const res = parseMoney("twenty-three kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand kyats", () => {
    const res = parseMoney("one thousand kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred kyats", () => {
    const res = parseMoney("a hundred kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(100);
  });

  test("parses half million kyats", () => {
    const res = parseMoney("half a million kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter kyat", () => {
    const res = parseMoney("a quarter kyat");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty kyats", () => {
    const res = parseMoney("about fifty kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand kyats", () => {
    const res = parseMoney("around one thousand kyats");
    expect(res.currency).toBe("MMK");
    expect(res.amount).toBe(1000);
  });
});

describe("Namibian Dollar (NAD)", () => {
  test("parses dollar currency name", () => {
    const res = parseMoney("73 dollar");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(73);
  });

  test("parses dollars plural", () => {
    const res = parseMoney("127 dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(127);
  });

  test("parses NAD ISO code before amount", () => {
    const res = parseMoney("NAD 843");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(843);
  });

  test("parses NAD ISO code after amount", () => {
    const res = parseMoney("1234 NAD");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(1234);
  });

  test("parses NAD with decimal", () => {
    const res = parseMoney("NAD 456.78");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dollar with decimal", () => {
    const res = parseMoney("99.25 dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Namibian Dollar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Namibian Dollar");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dollar", () => {
    const res = parseMoney("five hundred and sixty-seven dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(567);
  });

  test("parses half dollar", () => {
    const res = parseMoney("half a dollar");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dollar", () => {
    const res = parseMoney("one dollar");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dollars", () => {
    const res = parseMoney("twenty-three dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dollars", () => {
    const res = parseMoney("one thousand dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dollars", () => {
    const res = parseMoney("a hundred dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dollars", () => {
    const res = parseMoney("half a million dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dollar", () => {
    const res = parseMoney("a quarter dollar");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dollars", () => {
    const res = parseMoney("about fifty dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dollars", () => {
    const res = parseMoney("around one thousand dollars");
    expect(res.currency).toBe("NAD");
    expect(res.amount).toBe(1000);
  });
});

describe("Nepalese Rupee (NPR)", () => {
  test("parses rupee currency name", () => {
    const res = parseMoney("73 rupee");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(73);
  });

  test("parses rupees plural", () => {
    const res = parseMoney("127 rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(127);
  });

  test("parses NPR ISO code before amount", () => {
    const res = parseMoney("NPR 843");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(843);
  });

  test("parses NPR ISO code after amount", () => {
    const res = parseMoney("1234 NPR");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(1234);
  });

  test("parses NPR with decimal", () => {
    const res = parseMoney("NPR 456.78");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(456.78);
  });

  test("parses rupee with decimal", () => {
    const res = parseMoney("99.25 rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Nepalese Rupee with amount in sentence", () => {
    const res = parseMoney("The price is 999 Nepalese Rupee");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number rupee", () => {
    const res = parseMoney("five hundred and sixty-seven rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(567);
  });

  test("parses half rupee", () => {
    const res = parseMoney("half a rupee");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one rupee", () => {
    const res = parseMoney("one rupee");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three rupees", () => {
    const res = parseMoney("twenty-three rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand rupees", () => {
    const res = parseMoney("one thousand rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred rupees", () => {
    const res = parseMoney("a hundred rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(100);
  });

  test("parses half million rupees", () => {
    const res = parseMoney("half a million rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter rupee", () => {
    const res = parseMoney("a quarter rupee");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty rupees", () => {
    const res = parseMoney("about fifty rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand rupees", () => {
    const res = parseMoney("around one thousand rupees");
    expect(res.currency).toBe("NPR");
    expect(res.amount).toBe(1000);
  });
});

describe("Nicaraguan Córdoba (NIO)", () => {
  test("parses córdoba currency name", () => {
    const res = parseMoney("73 córdoba");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(73);
  });

  test("parses córdobas plural", () => {
    const res = parseMoney("127 córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(127);
  });

  test("parses NIO ISO code before amount", () => {
    const res = parseMoney("NIO 843");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(843);
  });

  test("parses NIO ISO code after amount", () => {
    const res = parseMoney("1234 NIO");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(1234);
  });

  test("parses NIO with decimal", () => {
    const res = parseMoney("NIO 456.78");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(456.78);
  });

  test("parses córdoba with decimal", () => {
    const res = parseMoney("99.25 córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(99.25);
  });

  test("parses Nicaraguan Córdoba with amount in sentence", () => {
    const res = parseMoney("The price is 999 Nicaraguan Córdoba");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(999);
  });

  test("parses worded number córdoba", () => {
    const res = parseMoney("five hundred and sixty-seven córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(567);
  });

  test("parses half córdoba", () => {
    const res = parseMoney("half a córdoba");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(0.5);
  });

  test("parses one córdoba", () => {
    const res = parseMoney("one córdoba");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three córdobas", () => {
    const res = parseMoney("twenty-three córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand córdobas", () => {
    const res = parseMoney("one thousand córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred córdobas", () => {
    const res = parseMoney("a hundred córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(100);
  });

  test("parses half million córdobas", () => {
    const res = parseMoney("half a million córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter córdoba", () => {
    const res = parseMoney("a quarter córdoba");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty córdobas", () => {
    const res = parseMoney("about fifty córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand córdobas", () => {
    const res = parseMoney("around one thousand córdobas");
    expect(res.currency).toBe("NIO");
    expect(res.amount).toBe(1000);
  });
});

describe("Nigerian Naira (NGN)", () => {
  test("parses naira currency name", () => {
    const res = parseMoney("73 naira");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(73);
  });

  test("parses nairas plural", () => {
    const res = parseMoney("127 nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(127);
  });

  test("parses NGN ISO code before amount", () => {
    const res = parseMoney("NGN 843");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(843);
  });

  test("parses NGN ISO code after amount", () => {
    const res = parseMoney("1234 NGN");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(1234);
  });

  test("parses NGN with decimal", () => {
    const res = parseMoney("NGN 456.78");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(456.78);
  });

  test("parses naira with decimal", () => {
    const res = parseMoney("99.25 nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Nigerian Naira with amount in sentence", () => {
    const res = parseMoney("The price is 999 Nigerian Naira");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number naira", () => {
    const res = parseMoney("five hundred and sixty-seven nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(567);
  });

  test("parses half naira", () => {
    const res = parseMoney("half a naira");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one naira", () => {
    const res = parseMoney("one naira");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three nairas", () => {
    const res = parseMoney("twenty-three nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand nairas", () => {
    const res = parseMoney("one thousand nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred nairas", () => {
    const res = parseMoney("a hundred nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(100);
  });

  test("parses half million nairas", () => {
    const res = parseMoney("half a million nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter naira", () => {
    const res = parseMoney("a quarter naira");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty nairas", () => {
    const res = parseMoney("about fifty nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand nairas", () => {
    const res = parseMoney("around one thousand nairas");
    expect(res.currency).toBe("NGN");
    expect(res.amount).toBe(1000);
  });
});

describe("North Korean Won (KPW)", () => {
  test("parses won currency name", () => {
    const res = parseMoney("73 won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(73);
  });

  test("parses won plural", () => {
    const res = parseMoney("127 won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(127);
  });

  test("parses KPW ISO code before amount", () => {
    const res = parseMoney("KPW 843");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(843);
  });

  test("parses KPW ISO code after amount", () => {
    const res = parseMoney("1234 KPW");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(1234);
  });

  test("parses KPW with decimal", () => {
    const res = parseMoney("KPW 456.78");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(456.78);
  });

  test("parses won with decimal", () => {
    const res = parseMoney("99.25 won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(99.25);
  });

  test("parses North Korean Won with amount in sentence", () => {
    const res = parseMoney("The price is 999 North Korean Won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(999);
  });

  test("parses worded number won", () => {
    const res = parseMoney("five hundred and sixty-seven won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(567);
  });

  test("parses half won", () => {
    const res = parseMoney("half a won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(0.5);
  });

  test("parses one won", () => {
    const res = parseMoney("one won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three won", () => {
    const res = parseMoney("twenty-three won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand won", () => {
    const res = parseMoney("one thousand won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred won", () => {
    const res = parseMoney("a hundred won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(100);
  });

  test("parses half million won", () => {
    const res = parseMoney("half a million won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter won", () => {
    const res = parseMoney("a quarter won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty won", () => {
    const res = parseMoney("about fifty won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand won", () => {
    const res = parseMoney("around one thousand won");
    expect(res.currency).toBe("KPW");
    expect(res.amount).toBe(1000);
  });
});

describe("Norwegian Krone (NOK)", () => {
  test("parses krone currency name", () => {
    const res = parseMoney("73 krone");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(73);
  });

  test("parses kroner plural", () => {
    const res = parseMoney("127 kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(127);
  });

  test("parses NOK ISO code before amount", () => {
    const res = parseMoney("NOK 843");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(843);
  });

  test("parses NOK ISO code after amount", () => {
    const res = parseMoney("1234 NOK");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(1234);
  });

  test("parses NOK with decimal", () => {
    const res = parseMoney("NOK 456.78");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(456.78);
  });

  test("parses krone with decimal", () => {
    const res = parseMoney("99.25 kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Norwegian Krone with amount in sentence", () => {
    const res = parseMoney("The price is 999 Norwegian Krone");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number krone", () => {
    const res = parseMoney("five hundred and sixty-seven kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(567);
  });

  test("parses half krone", () => {
    const res = parseMoney("half a krone");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one krone", () => {
    const res = parseMoney("one krone");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three kroner", () => {
    const res = parseMoney("twenty-three kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand kroner", () => {
    const res = parseMoney("one thousand kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred kroner", () => {
    const res = parseMoney("a hundred kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(100);
  });

  test("parses half million kroner", () => {
    const res = parseMoney("half a million kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter krone", () => {
    const res = parseMoney("a quarter krone");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty kroner", () => {
    const res = parseMoney("about fifty kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand kroner", () => {
    const res = parseMoney("around one thousand kroner");
    expect(res.currency).toBe("NOK");
    expect(res.amount).toBe(1000);
  });
});

describe("Omani Rial (OMR)", () => {
  test("parses rial currency name", () => {
    const res = parseMoney("73 rial");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(73);
  });

  test("parses rials plural", () => {
    const res = parseMoney("127 rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(127);
  });

  test("parses OMR ISO code before amount", () => {
    const res = parseMoney("OMR 843");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(843);
  });

  test("parses OMR ISO code after amount", () => {
    const res = parseMoney("1234 OMR");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(1234);
  });

  test("parses OMR with decimal", () => {
    const res = parseMoney("OMR 456.78");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(456.78);
  });

  test("parses rial with decimal", () => {
    const res = parseMoney("99.25 rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Omani Rial with amount in sentence", () => {
    const res = parseMoney("The price is 999 Omani Rial");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number rial", () => {
    const res = parseMoney("five hundred and sixty-seven rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(567);
  });

  test("parses half rial", () => {
    const res = parseMoney("half a rial");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one rial", () => {
    const res = parseMoney("one rial");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three rials", () => {
    const res = parseMoney("twenty-three rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand rials", () => {
    const res = parseMoney("one thousand rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred rials", () => {
    const res = parseMoney("a hundred rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(100);
  });

  test("parses half million rials", () => {
    const res = parseMoney("half a million rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter rial", () => {
    const res = parseMoney("a quarter rial");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty rials", () => {
    const res = parseMoney("about fifty rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand rials", () => {
    const res = parseMoney("around one thousand rials");
    expect(res.currency).toBe("OMR");
    expect(res.amount).toBe(1000);
  });
});

describe("Pakistani Rupee (PKR)", () => {
  test("parses rupee currency name", () => {
    const res = parseMoney("73 rupee");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(73);
  });

  test("parses rupees plural", () => {
    const res = parseMoney("127 rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(127);
  });

  test("parses PKR ISO code before amount", () => {
    const res = parseMoney("PKR 843");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(843);
  });

  test("parses PKR ISO code after amount", () => {
    const res = parseMoney("1234 PKR");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(1234);
  });

  test("parses PKR with decimal", () => {
    const res = parseMoney("PKR 456.78");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(456.78);
  });

  test("parses rupee with decimal", () => {
    const res = parseMoney("99.25 rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Pakistani Rupee with amount in sentence", () => {
    const res = parseMoney("The price is 999 Pakistani Rupee");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number rupee", () => {
    const res = parseMoney("five hundred and sixty-seven rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(567);
  });

  test("parses half rupee", () => {
    const res = parseMoney("half a rupee");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one rupee", () => {
    const res = parseMoney("one rupee");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three rupees", () => {
    const res = parseMoney("twenty-three rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand rupees", () => {
    const res = parseMoney("one thousand rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred rupees", () => {
    const res = parseMoney("a hundred rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(100);
  });

  test("parses half million rupees", () => {
    const res = parseMoney("half a million rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter rupee", () => {
    const res = parseMoney("a quarter rupee");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty rupees", () => {
    const res = parseMoney("about fifty rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand rupees", () => {
    const res = parseMoney("around one thousand rupees");
    expect(res.currency).toBe("PKR");
    expect(res.amount).toBe(1000);
  });
});

describe("Panamanian Balboa (PAB)", () => {
  test("parses balboa currency name", () => {
    const res = parseMoney("73 balboa");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(73);
  });

  test("parses balboas plural", () => {
    const res = parseMoney("127 balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(127);
  });

  test("parses PAB ISO code before amount", () => {
    const res = parseMoney("PAB 843");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(843);
  });

  test("parses PAB ISO code after amount", () => {
    const res = parseMoney("1234 PAB");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(1234);
  });

  test("parses PAB with decimal", () => {
    const res = parseMoney("PAB 456.78");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(456.78);
  });

  test("parses balboa with decimal", () => {
    const res = parseMoney("99.25 balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(99.25);
  });

  test("parses Panamanian Balboa with amount in sentence", () => {
    const res = parseMoney("The price is 999 Panamanian Balboa");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(999);
  });

  test("parses worded number balboa", () => {
    const res = parseMoney("five hundred and sixty-seven balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(567);
  });

  test("parses half balboa", () => {
    const res = parseMoney("half a balboa");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(0.5);
  });

  test("parses one balboa", () => {
    const res = parseMoney("one balboa");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three balboas", () => {
    const res = parseMoney("twenty-three balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand balboas", () => {
    const res = parseMoney("one thousand balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred balboas", () => {
    const res = parseMoney("a hundred balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(100);
  });

  test("parses half million balboas", () => {
    const res = parseMoney("half a million balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter balboa", () => {
    const res = parseMoney("a quarter balboa");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty balboas", () => {
    const res = parseMoney("about fifty balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand balboas", () => {
    const res = parseMoney("around one thousand balboas");
    expect(res.currency).toBe("PAB");
    expect(res.amount).toBe(1000);
  });
});

describe("Papua New Guinea Kina (PGK)", () => {
  test("parses kina currency name", () => {
    const res = parseMoney("73 kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(73);
  });

  test("parses kina plural", () => {
    const res = parseMoney("127 kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(127);
  });

  test("parses PGK ISO code before amount", () => {
    const res = parseMoney("PGK 843");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(843);
  });

  test("parses PGK ISO code after amount", () => {
    const res = parseMoney("1234 PGK");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(1234);
  });

  test("parses PGK with decimal", () => {
    const res = parseMoney("PGK 456.78");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(456.78);
  });

  test("parses kina with decimal", () => {
    const res = parseMoney("99.25 kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(99.25);
  });

  test("parses Papua New Guinea Kina with amount in sentence", () => {
    const res = parseMoney("The price is 999 Papua New Guinea Kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(999);
  });

  test("parses worded number kina", () => {
    const res = parseMoney("five hundred and sixty-seven kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(567);
  });

  test("parses half kina", () => {
    const res = parseMoney("half a kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(0.5);
  });

  test("parses one kina", () => {
    const res = parseMoney("one kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three kina", () => {
    const res = parseMoney("twenty-three kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand kina", () => {
    const res = parseMoney("one thousand kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred kina", () => {
    const res = parseMoney("a hundred kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(100);
  });

  test("parses half million kina", () => {
    const res = parseMoney("half a million kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter kina", () => {
    const res = parseMoney("a quarter kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty kina", () => {
    const res = parseMoney("about fifty kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand kina", () => {
    const res = parseMoney("around one thousand kina");
    expect(res.currency).toBe("PGK");
    expect(res.amount).toBe(1000);
  });
});

describe("Paraguayan Guarani (PYG)", () => {
  test("parses guarani currency name", () => {
    const res = parseMoney("73 guarani");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(73);
  });

  test("parses guaranies plural", () => {
    const res = parseMoney("127 guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(127);
  });

  test("parses PYG ISO code before amount", () => {
    const res = parseMoney("PYG 843");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(843);
  });

  test("parses PYG ISO code after amount", () => {
    const res = parseMoney("1234 PYG");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(1234);
  });

  test("parses PYG with decimal", () => {
    const res = parseMoney("PYG 456.78");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(456.78);
  });

  test("parses guarani with decimal", () => {
    const res = parseMoney("99.25 guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(99.25);
  });

  test("parses Paraguayan Guarani with amount in sentence", () => {
    const res = parseMoney("The price is 999 Paraguayan Guarani");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(999);
  });

  test("parses worded number guarani", () => {
    const res = parseMoney("five hundred and sixty-seven guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(567);
  });

  test("parses half guarani", () => {
    const res = parseMoney("half a guarani");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(0.5);
  });

  test("parses one guarani", () => {
    const res = parseMoney("one guarani");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three guaranies", () => {
    const res = parseMoney("twenty-three guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand guaranies", () => {
    const res = parseMoney("one thousand guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred guaranies", () => {
    const res = parseMoney("a hundred guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(100);
  });

  test("parses half million guaranies", () => {
    const res = parseMoney("half a million guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter guarani", () => {
    const res = parseMoney("a quarter guarani");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty guaranies", () => {
    const res = parseMoney("about fifty guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand guaranies", () => {
    const res = parseMoney("around one thousand guaranies");
    expect(res.currency).toBe("PYG");
    expect(res.amount).toBe(1000);
  });
});

describe("Peruvian Sol (PEN)", () => {
  test("parses sol currency name", () => {
    const res = parseMoney("73 sol");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(73);
  });

  test("parses soles plural", () => {
    const res = parseMoney("127 soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(127);
  });

  test("parses PEN ISO code before amount", () => {
    const res = parseMoney("PEN 843");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(843);
  });

  test("parses PEN ISO code after amount", () => {
    const res = parseMoney("1234 PEN");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(1234);
  });

  test("parses PEN with decimal", () => {
    const res = parseMoney("PEN 456.78");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(456.78);
  });

  test("parses sol with decimal", () => {
    const res = parseMoney("99.25 soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Peruvian Sol with amount in sentence", () => {
    const res = parseMoney("The price is 999 Peruvian Sol");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number sol", () => {
    const res = parseMoney("five hundred and sixty-seven soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(567);
  });

  test("parses half sol", () => {
    const res = parseMoney("half a sol");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one sol", () => {
    const res = parseMoney("one sol");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three soles", () => {
    const res = parseMoney("twenty-three soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand soles", () => {
    const res = parseMoney("one thousand soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred soles", () => {
    const res = parseMoney("a hundred soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(100);
  });

  test("parses half million soles", () => {
    const res = parseMoney("half a million soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter sol", () => {
    const res = parseMoney("a quarter sol");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty soles", () => {
    const res = parseMoney("about fifty soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand soles", () => {
    const res = parseMoney("around one thousand soles");
    expect(res.currency).toBe("PEN");
    expect(res.amount).toBe(1000);
  });
});

describe("Philippine Peso (PHP)", () => {
  test("parses peso currency name", () => {
    const res = parseMoney("73 peso");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(73);
  });

  test("parses pesos plural", () => {
    const res = parseMoney("127 pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(127);
  });

  test("parses PHP ISO code before amount", () => {
    const res = parseMoney("PHP 843");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(843);
  });

  test("parses PHP ISO code after amount", () => {
    const res = parseMoney("1234 PHP");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(1234);
  });

  test("parses PHP with decimal", () => {
    const res = parseMoney("PHP 456.78");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(456.78);
  });

  test("parses peso with decimal", () => {
    const res = parseMoney("99.25 pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(99.25);
  });

  test("parses Philippine Peso with amount in sentence", () => {
    const res = parseMoney("The price is 999 Philippine Peso");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(999);
  });

  test("parses worded number peso", () => {
    const res = parseMoney("five hundred and sixty-seven pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(567);
  });

  test("parses half peso", () => {
    const res = parseMoney("half a peso");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(0.5);
  });

  test("parses one peso", () => {
    const res = parseMoney("one peso");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three pesos", () => {
    const res = parseMoney("twenty-three pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand pesos", () => {
    const res = parseMoney("one thousand pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred pesos", () => {
    const res = parseMoney("a hundred pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(100);
  });

  test("parses half million pesos", () => {
    const res = parseMoney("half a million pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter peso", () => {
    const res = parseMoney("a quarter peso");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty pesos", () => {
    const res = parseMoney("about fifty pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand pesos", () => {
    const res = parseMoney("around one thousand pesos");
    expect(res.currency).toBe("PHP");
    expect(res.amount).toBe(1000);
  });
});

describe("Polish Złoty (PLN)", () => {
  test("parses złoty currency name", () => {
    const res = parseMoney("73 złoty");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(73);
  });

  test("parses złote plural", () => {
    const res = parseMoney("127 złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(127);
  });

  test("parses PLN ISO code before amount", () => {
    const res = parseMoney("PLN 843");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(843);
  });

  test("parses PLN ISO code after amount", () => {
    const res = parseMoney("1234 PLN");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(1234);
  });

  test("parses PLN with decimal", () => {
    const res = parseMoney("PLN 456.78");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(456.78);
  });

  test("parses złoty with decimal", () => {
    const res = parseMoney("99.25 złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(99.25);
  });

  test("parses Polish Złoty with amount in sentence", () => {
    const res = parseMoney("The price is 999 Polish Złoty");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(999);
  });

  test("parses worded number złoty", () => {
    const res = parseMoney("five hundred and sixty-seven złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(567);
  });

  test("parses half złoty", () => {
    const res = parseMoney("half a złoty");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(0.5);
  });

  test("parses one złoty", () => {
    const res = parseMoney("one złoty");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three złote", () => {
    const res = parseMoney("twenty-three złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand złote", () => {
    const res = parseMoney("one thousand złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred złote", () => {
    const res = parseMoney("a hundred złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(100);
  });

  test("parses half million złote", () => {
    const res = parseMoney("half a million złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter złoty", () => {
    const res = parseMoney("a quarter złoty");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty złote", () => {
    const res = parseMoney("about fifty złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand złote", () => {
    const res = parseMoney("around one thousand złote");
    expect(res.currency).toBe("PLN");
    expect(res.amount).toBe(1000);
  });
});

describe("Qatari Riyal (QAR)", () => {
  test("parses riyal currency name", () => {
    const res = parseMoney("73 riyal");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(73);
  });

  test("parses riyals plural", () => {
    const res = parseMoney("127 riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(127);
  });

  test("parses QAR ISO code before amount", () => {
    const res = parseMoney("QAR 843");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(843);
  });

  test("parses QAR ISO code after amount", () => {
    const res = parseMoney("1234 QAR");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(1234);
  });

  test("parses QAR with decimal", () => {
    const res = parseMoney("QAR 456.78");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(456.78);
  });

  test("parses riyal with decimal", () => {
    const res = parseMoney("99.25 riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Qatari Riyal with amount in sentence", () => {
    const res = parseMoney("The price is 999 Qatari Riyal");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number riyal", () => {
    const res = parseMoney("five hundred and sixty-seven riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(567);
  });

  test("parses half riyal", () => {
    const res = parseMoney("half a riyal");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one riyal", () => {
    const res = parseMoney("one riyal");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three riyals", () => {
    const res = parseMoney("twenty-three riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand riyals", () => {
    const res = parseMoney("one thousand riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred riyals", () => {
    const res = parseMoney("a hundred riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(100);
  });

  test("parses half million riyals", () => {
    const res = parseMoney("half a million riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter riyal", () => {
    const res = parseMoney("a quarter riyal");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty riyals", () => {
    const res = parseMoney("about fifty riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand riyals", () => {
    const res = parseMoney("around one thousand riyals");
    expect(res.currency).toBe("QAR");
    expect(res.amount).toBe(1000);
  });
});

describe("Romanian Leu (RON)", () => {
  test("parses leu currency name", () => {
    const res = parseMoney("73 leu");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(73);
  });

  test("parses lei plural", () => {
    const res = parseMoney("127 lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(127);
  });

  test("parses RON ISO code before amount", () => {
    const res = parseMoney("RON 843");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(843);
  });

  test("parses RON ISO code after amount", () => {
    const res = parseMoney("1234 RON");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(1234);
  });

  test("parses RON with decimal", () => {
    const res = parseMoney("RON 456.78");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(456.78);
  });

  test("parses leu with decimal", () => {
    const res = parseMoney("99.25 lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(99.25);
  });

  test("parses Romanian Leu with amount in sentence", () => {
    const res = parseMoney("The price is 999 Romanian Leu");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(999);
  });

  test("parses worded number leu", () => {
    const res = parseMoney("five hundred and sixty-seven lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(567);
  });

  test("parses half leu", () => {
    const res = parseMoney("half a leu");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(0.5);
  });

  test("parses one leu", () => {
    const res = parseMoney("one leu");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three lei", () => {
    const res = parseMoney("twenty-three lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand lei", () => {
    const res = parseMoney("one thousand lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred lei", () => {
    const res = parseMoney("a hundred lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(100);
  });

  test("parses half million lei", () => {
    const res = parseMoney("half a million lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter leu", () => {
    const res = parseMoney("a quarter leu");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty lei", () => {
    const res = parseMoney("about fifty lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand lei", () => {
    const res = parseMoney("around one thousand lei");
    expect(res.currency).toBe("RON");
    expect(res.amount).toBe(1000);
  });
});

describe("Rwandan Franc (RWF)", () => {
  test("parses franc currency name", () => {
    const res = parseMoney("73 franc");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(73);
  });

  test("parses francs plural", () => {
    const res = parseMoney("127 francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(127);
  });

  test("parses RWF ISO code before amount", () => {
    const res = parseMoney("RWF 843");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(843);
  });

  test("parses RWF ISO code after amount", () => {
    const res = parseMoney("1234 RWF");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(1234);
  });

  test("parses RWF with decimal", () => {
    const res = parseMoney("RWF 456.78");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(456.78);
  });

  test("parses franc with decimal", () => {
    const res = parseMoney("99.25 francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(99.25);
  });

  test("parses Rwandan Franc with amount in sentence", () => {
    const res = parseMoney("The price is 999 Rwandan Franc");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(999);
  });

  test("parses worded number franc", () => {
    const res = parseMoney("five hundred and sixty-seven francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(567);
  });

  test("parses half franc", () => {
    const res = parseMoney("half a franc");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(0.5);
  });

  test("parses one franc", () => {
    const res = parseMoney("one franc");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three francs", () => {
    const res = parseMoney("twenty-three francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand francs", () => {
    const res = parseMoney("one thousand francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred francs", () => {
    const res = parseMoney("a hundred francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(100);
  });

  test("parses half million francs", () => {
    const res = parseMoney("half a million francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter franc", () => {
    const res = parseMoney("a quarter franc");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty francs", () => {
    const res = parseMoney("about fifty francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand francs", () => {
    const res = parseMoney("around one thousand francs");
    expect(res.currency).toBe("RWF");
    expect(res.amount).toBe(1000);
  });
});

describe("Salvadoran Colón (SVC)", () => {
  test("parses colón currency name", () => {
    const res = parseMoney("73 colón");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(73);
  });

  test("parses colones plural", () => {
    const res = parseMoney("127 colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(127);
  });

  test("parses SVC ISO code before amount", () => {
    const res = parseMoney("SVC 843");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(843);
  });

  test("parses SVC ISO code after amount", () => {
    const res = parseMoney("1234 SVC");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(1234);
  });

  test("parses SVC with decimal", () => {
    const res = parseMoney("SVC 456.78");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(456.78);
  });

  test("parses colón with decimal", () => {
    const res = parseMoney("99.25 colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(99.25);
  });

  test("parses Salvadoran Colón with amount in sentence", () => {
    const res = parseMoney("The price is 999 Salvadoran Colón");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(999);
  });

  test("parses worded number colón", () => {
    const res = parseMoney("five hundred and sixty-seven colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(567);
  });

  test("parses half colón", () => {
    const res = parseMoney("half a colón");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(0.5);
  });

  test("parses one colón", () => {
    const res = parseMoney("one colón");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three colones", () => {
    const res = parseMoney("twenty-three colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand colones", () => {
    const res = parseMoney("one thousand colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred colones", () => {
    const res = parseMoney("a hundred colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(100);
  });

  test("parses half million colones", () => {
    const res = parseMoney("half a million colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter colón", () => {
    const res = parseMoney("a quarter colón");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty colones", () => {
    const res = parseMoney("about fifty colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand colones", () => {
    const res = parseMoney("around one thousand colones");
    expect(res.currency).toBe("SVC");
    expect(res.amount).toBe(1000);
  });
});

describe("Saudi Riyal (SAR)", () => {
  test("parses riyal currency name", () => {
    const res = parseMoney("73 riyal");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(73);
  });

  test("parses riyals plural", () => {
    const res = parseMoney("127 riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(127);
  });

  test("parses SAR ISO code before amount", () => {
    const res = parseMoney("SAR 843");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(843);
  });

  test("parses SAR ISO code after amount", () => {
    const res = parseMoney("1234 SAR");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(1234);
  });

  test("parses SAR with decimal", () => {
    const res = parseMoney("SAR 456.78");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(456.78);
  });

  test("parses riyal with decimal", () => {
    const res = parseMoney("99.25 riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Saudi Riyal with amount in sentence", () => {
    const res = parseMoney("The price is 999 Saudi Riyal");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number riyal", () => {
    const res = parseMoney("five hundred and sixty-seven riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(567);
  });

  test("parses half riyal", () => {
    const res = parseMoney("half a riyal");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one riyal", () => {
    const res = parseMoney("one riyal");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three riyals", () => {
    const res = parseMoney("twenty-three riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand riyals", () => {
    const res = parseMoney("one thousand riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred riyals", () => {
    const res = parseMoney("a hundred riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(100);
  });

  test("parses half million riyals", () => {
    const res = parseMoney("half a million riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter riyal", () => {
    const res = parseMoney("a quarter riyal");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty riyals", () => {
    const res = parseMoney("about fifty riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand riyals", () => {
    const res = parseMoney("around one thousand riyals");
    expect(res.currency).toBe("SAR");
    expect(res.amount).toBe(1000);
  });
});

describe("Serbian Dinar (RSD)", () => {
  test("parses dinar currency name", () => {
    const res = parseMoney("73 dinar");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(73);
  });

  test("parses dinars plural", () => {
    const res = parseMoney("127 dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(127);
  });

  test("parses RSD ISO code before amount", () => {
    const res = parseMoney("RSD 843");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(843);
  });

  test("parses RSD ISO code after amount", () => {
    const res = parseMoney("1234 RSD");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(1234);
  });

  test("parses RSD with decimal", () => {
    const res = parseMoney("RSD 456.78");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dinar with decimal", () => {
    const res = parseMoney("99.25 dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Serbian Dinar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Serbian Dinar");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dinar", () => {
    const res = parseMoney("five hundred and sixty-seven dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(567);
  });

  test("parses half dinar", () => {
    const res = parseMoney("half a dinar");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dinar", () => {
    const res = parseMoney("one dinar");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dinars", () => {
    const res = parseMoney("twenty-three dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dinars", () => {
    const res = parseMoney("one thousand dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dinars", () => {
    const res = parseMoney("a hundred dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dinars", () => {
    const res = parseMoney("half a million dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dinar", () => {
    const res = parseMoney("a quarter dinar");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dinars", () => {
    const res = parseMoney("about fifty dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dinars", () => {
    const res = parseMoney("around one thousand dinars");
    expect(res.currency).toBe("RSD");
    expect(res.amount).toBe(1000);
  });
});

describe("Sierra Leonean Leone (SLL)", () => {
  test("parses leone currency name", () => {
    const res = parseMoney("73 leone");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(73);
  });

  test("parses leones plural", () => {
    const res = parseMoney("127 leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(127);
  });

  test("parses SLL ISO code before amount", () => {
    const res = parseMoney("SLL 843");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(843);
  });

  test("parses SLL ISO code after amount", () => {
    const res = parseMoney("1234 SLL");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(1234);
  });

  test("parses SLL with decimal", () => {
    const res = parseMoney("SLL 456.78");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(456.78);
  });

  test("parses leone with decimal", () => {
    const res = parseMoney("99.25 leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Sierra Leonean Leone with amount in sentence", () => {
    const res = parseMoney("The price is 999 Sierra Leonean Leone");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number leone", () => {
    const res = parseMoney("five hundred and sixty-seven leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(567);
  });

  test("parses half leone", () => {
    const res = parseMoney("half a leone");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one leone", () => {
    const res = parseMoney("one leone");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three leones", () => {
    const res = parseMoney("twenty-three leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand leones", () => {
    const res = parseMoney("one thousand leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred leones", () => {
    const res = parseMoney("a hundred leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(100);
  });

  test("parses half million leones", () => {
    const res = parseMoney("half a million leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter leone", () => {
    const res = parseMoney("a quarter leone");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty leones", () => {
    const res = parseMoney("about fifty leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand leones", () => {
    const res = parseMoney("around one thousand leones");
    expect(res.currency).toBe("SLL");
    expect(res.amount).toBe(1000);
  });
});

describe("Somali Shilling (SOS)", () => {
  test("parses shilling currency name", () => {
    const res = parseMoney("73 shilling");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(73);
  });

  test("parses shillings plural", () => {
    const res = parseMoney("127 shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(127);
  });

  test("parses SOS ISO code before amount", () => {
    const res = parseMoney("SOS 843");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(843);
  });

  test("parses SOS ISO code after amount", () => {
    const res = parseMoney("1234 SOS");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(1234);
  });

  test("parses SOS with decimal", () => {
    const res = parseMoney("SOS 456.78");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(456.78);
  });

  test("parses shilling with decimal", () => {
    const res = parseMoney("99.25 shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(99.25);
  });

  test("parses Somali Shilling with amount in sentence", () => {
    const res = parseMoney("The price is 999 Somali Shilling");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(999);
  });

  test("parses worded number shilling", () => {
    const res = parseMoney("five hundred and sixty-seven shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(567);
  });

  test("parses half shilling", () => {
    const res = parseMoney("half a shilling");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(0.5);
  });

  test("parses one shilling", () => {
    const res = parseMoney("one shilling");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three shillings", () => {
    const res = parseMoney("twenty-three shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand shillings", () => {
    const res = parseMoney("one thousand shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred shillings", () => {
    const res = parseMoney("a hundred shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(100);
  });

  test("parses half million shillings", () => {
    const res = parseMoney("half a million shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter shilling", () => {
    const res = parseMoney("a quarter shilling");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty shillings", () => {
    const res = parseMoney("about fifty shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand shillings", () => {
    const res = parseMoney("around one thousand shillings");
    expect(res.currency).toBe("SOS");
    expect(res.amount).toBe(1000);
  });
});

describe("South Sudanese Pound (SSP)", () => {
  test("parses pound currency name", () => {
    const res = parseMoney("73 pound");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(73);
  });

  test("parses pounds plural", () => {
    const res = parseMoney("127 pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(127);
  });

  test("parses SSP ISO code before amount", () => {
    const res = parseMoney("SSP 843");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(843);
  });

  test("parses SSP ISO code after amount", () => {
    const res = parseMoney("1234 SSP");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(1234);
  });

  test("parses SSP with decimal", () => {
    const res = parseMoney("SSP 456.78");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(456.78);
  });

  test("parses pound with decimal", () => {
    const res = parseMoney("99.25 pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(99.25);
  });

  test("parses South Sudanese Pound with amount in sentence", () => {
    const res = parseMoney("The price is 999 South Sudanese Pound");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(999);
  });

  test("parses worded number pound", () => {
    const res = parseMoney("five hundred and sixty-seven pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(567);
  });

  test("parses half pound", () => {
    const res = parseMoney("half a pound");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(0.5);
  });

  test("parses one pound", () => {
    const res = parseMoney("one pound");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three pounds", () => {
    const res = parseMoney("twenty-three pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand pounds", () => {
    const res = parseMoney("one thousand pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred pounds", () => {
    const res = parseMoney("a hundred pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(100);
  });

  test("parses half million pounds", () => {
    const res = parseMoney("half a million pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter pound", () => {
    const res = parseMoney("a quarter pound");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty pounds", () => {
    const res = parseMoney("about fifty pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand pounds", () => {
    const res = parseMoney("around one thousand pounds");
    expect(res.currency).toBe("SSP");
    expect(res.amount).toBe(1000);
  });
});

describe("Sri Lankan Rupee (LKR)", () => {
  test("parses rupee currency name", () => {
    const res = parseMoney("73 rupee");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(73);
  });

  test("parses rupees plural", () => {
    const res = parseMoney("127 rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(127);
  });

  test("parses LKR ISO code before amount", () => {
    const res = parseMoney("LKR 843");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(843);
  });

  test("parses LKR ISO code after amount", () => {
    const res = parseMoney("1234 LKR");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(1234);
  });

  test("parses LKR with decimal", () => {
    const res = parseMoney("LKR 456.78");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(456.78);
  });

  test("parses rupee with decimal", () => {
    const res = parseMoney("99.25 rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(99.25);
  });

  test("parses Sri Lankan Rupee with amount in sentence", () => {
    const res = parseMoney("The price is 999 Sri Lankan Rupee");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(999);
  });

  test("parses worded number rupee", () => {
    const res = parseMoney("five hundred and sixty-seven rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(567);
  });

  test("parses half rupee", () => {
    const res = parseMoney("half a rupee");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(0.5);
  });

  test("parses one rupee", () => {
    const res = parseMoney("one rupee");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three rupees", () => {
    const res = parseMoney("twenty-three rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand rupees", () => {
    const res = parseMoney("one thousand rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred rupees", () => {
    const res = parseMoney("a hundred rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(100);
  });

  test("parses half million rupees", () => {
    const res = parseMoney("half a million rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter rupee", () => {
    const res = parseMoney("a quarter rupee");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty rupees", () => {
    const res = parseMoney("about fifty rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand rupees", () => {
    const res = parseMoney("around one thousand rupees");
    expect(res.currency).toBe("LKR");
    expect(res.amount).toBe(1000);
  });
});

describe("Sudanese Pound (SDG)", () => {
  test("parses pound currency name", () => {
    const res = parseMoney("73 pound");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(73);
  });

  test("parses pounds plural", () => {
    const res = parseMoney("127 pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(127);
  });

  test("parses SDG ISO code before amount", () => {
    const res = parseMoney("SDG 843");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(843);
  });

  test("parses SDG ISO code after amount", () => {
    const res = parseMoney("1234 SDG");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(1234);
  });

  test("parses SDG with decimal", () => {
    const res = parseMoney("SDG 456.78");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(456.78);
  });

  test("parses pound with decimal", () => {
    const res = parseMoney("99.25 pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(99.25);
  });

  test("parses Sudanese Pound with amount in sentence", () => {
    const res = parseMoney("The price is 999 Sudanese Pound");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(999);
  });

  test("parses worded number pound", () => {
    const res = parseMoney("five hundred and sixty-seven pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(567);
  });

  test("parses half pound", () => {
    const res = parseMoney("half a pound");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(0.5);
  });

  test("parses one pound", () => {
    const res = parseMoney("one pound");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three pounds", () => {
    const res = parseMoney("twenty-three pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand pounds", () => {
    const res = parseMoney("one thousand pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred pounds", () => {
    const res = parseMoney("a hundred pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(100);
  });

  test("parses half million pounds", () => {
    const res = parseMoney("half a million pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter pound", () => {
    const res = parseMoney("a quarter pound");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty pounds", () => {
    const res = parseMoney("about fifty pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand pounds", () => {
    const res = parseMoney("around one thousand pounds");
    expect(res.currency).toBe("SDG");
    expect(res.amount).toBe(1000);
  });
});

describe("Surinamese Dollar (SRD)", () => {
  test("parses dollar currency name", () => {
    const res = parseMoney("73 dollar");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(73);
  });

  test("parses dollars plural", () => {
    const res = parseMoney("127 dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(127);
  });

  test("parses SRD ISO code before amount", () => {
    const res = parseMoney("SRD 843");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(843);
  });

  test("parses SRD ISO code after amount", () => {
    const res = parseMoney("1234 SRD");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(1234);
  });

  test("parses SRD with decimal", () => {
    const res = parseMoney("SRD 456.78");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dollar with decimal", () => {
    const res = parseMoney("99.25 dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Surinamese Dollar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Surinamese Dollar");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dollar", () => {
    const res = parseMoney("five hundred and sixty-seven dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(567);
  });

  test("parses half dollar", () => {
    const res = parseMoney("half a dollar");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dollar", () => {
    const res = parseMoney("one dollar");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dollars", () => {
    const res = parseMoney("twenty-three dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dollars", () => {
    const res = parseMoney("one thousand dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dollars", () => {
    const res = parseMoney("a hundred dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dollars", () => {
    const res = parseMoney("half a million dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dollar", () => {
    const res = parseMoney("a quarter dollar");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dollars", () => {
    const res = parseMoney("about fifty dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dollars", () => {
    const res = parseMoney("around one thousand dollars");
    expect(res.currency).toBe("SRD");
    expect(res.amount).toBe(1000);
  });
});

describe("Swazi Lilangeni (SZL)", () => {
  test("parses lilangeni currency name", () => {
    const res = parseMoney("73 lilangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(73);
  });

  test("parses emalangeni plural", () => {
    const res = parseMoney("127 emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(127);
  });

  test("parses SZL ISO code before amount", () => {
    const res = parseMoney("SZL 843");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(843);
  });

  test("parses SZL ISO code after amount", () => {
    const res = parseMoney("1234 SZL");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(1234);
  });

  test("parses SZL with decimal", () => {
    const res = parseMoney("SZL 456.78");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(456.78);
  });

  test("parses lilangeni with decimal", () => {
    const res = parseMoney("99.25 emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(99.25);
  });

  test("parses Swazi Lilangeni with amount in sentence", () => {
    const res = parseMoney("The price is 999 Swazi Lilangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(999);
  });

  test("parses worded number lilangeni", () => {
    const res = parseMoney("five hundred and sixty-seven emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(567);
  });

  test("parses half lilangeni", () => {
    const res = parseMoney("half a lilangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(0.5);
  });

  test("parses one lilangeni", () => {
    const res = parseMoney("one lilangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three emalangeni", () => {
    const res = parseMoney("twenty-three emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand emalangeni", () => {
    const res = parseMoney("one thousand emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred emalangeni", () => {
    const res = parseMoney("a hundred emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(100);
  });

  test("parses half million emalangeni", () => {
    const res = parseMoney("half a million emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter lilangeni", () => {
    const res = parseMoney("a quarter lilangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty emalangeni", () => {
    const res = parseMoney("about fifty emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand emalangeni", () => {
    const res = parseMoney("around one thousand emalangeni");
    expect(res.currency).toBe("SZL");
    expect(res.amount).toBe(1000);
  });
});

describe("Syrian Pound (SYP)", () => {
  test("parses pound currency name", () => {
    const res = parseMoney("73 pound");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(73);
  });

  test("parses pounds plural", () => {
    const res = parseMoney("127 pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(127);
  });

  test("parses SYP ISO code before amount", () => {
    const res = parseMoney("SYP 843");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(843);
  });

  test("parses SYP ISO code after amount", () => {
    const res = parseMoney("1234 SYP");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(1234);
  });

  test("parses SYP with decimal", () => {
    const res = parseMoney("SYP 456.78");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(456.78);
  });

  test("parses pound with decimal", () => {
    const res = parseMoney("99.25 pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(99.25);
  });

  test("parses Syrian Pound with amount in sentence", () => {
    const res = parseMoney("The price is 999 Syrian Pound");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(999);
  });

  test("parses worded number pound", () => {
    const res = parseMoney("five hundred and sixty-seven pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(567);
  });

  test("parses half pound", () => {
    const res = parseMoney("half a pound");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(0.5);
  });

  test("parses one pound", () => {
    const res = parseMoney("one pound");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three pounds", () => {
    const res = parseMoney("twenty-three pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand pounds", () => {
    const res = parseMoney("one thousand pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred pounds", () => {
    const res = parseMoney("a hundred pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(100);
  });

  test("parses half million pounds", () => {
    const res = parseMoney("half a million pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter pound", () => {
    const res = parseMoney("a quarter pound");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty pounds", () => {
    const res = parseMoney("about fifty pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand pounds", () => {
    const res = parseMoney("around one thousand pounds");
    expect(res.currency).toBe("SYP");
    expect(res.amount).toBe(1000);
  });
});

describe("Tajikistani Somoni (TJS)", () => {
  test("parses somoni currency name", () => {
    const res = parseMoney("73 somoni");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(73);
  });

  test("parses somonis plural", () => {
    const res = parseMoney("127 somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(127);
  });

  test("parses TJS ISO code before amount", () => {
    const res = parseMoney("TJS 843");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(843);
  });

  test("parses TJS ISO code after amount", () => {
    const res = parseMoney("1234 TJS");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(1234);
  });

  test("parses TJS with decimal", () => {
    const res = parseMoney("TJS 456.78");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(456.78);
  });

  test("parses somoni with decimal", () => {
    const res = parseMoney("99.25 somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(99.25);
  });

  test("parses Tajikistani Somoni with amount in sentence", () => {
    const res = parseMoney("The price is 999 Tajikistani Somoni");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(999);
  });

  test("parses worded number somoni", () => {
    const res = parseMoney("five hundred and sixty-seven somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(567);
  });

  test("parses half somoni", () => {
    const res = parseMoney("half a somoni");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(0.5);
  });

  test("parses one somoni", () => {
    const res = parseMoney("one somoni");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three somonis", () => {
    const res = parseMoney("twenty-three somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand somonis", () => {
    const res = parseMoney("one thousand somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred somonis", () => {
    const res = parseMoney("a hundred somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(100);
  });

  test("parses half million somonis", () => {
    const res = parseMoney("half a million somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter somoni", () => {
    const res = parseMoney("a quarter somoni");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty somonis", () => {
    const res = parseMoney("about fifty somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand somonis", () => {
    const res = parseMoney("around one thousand somonis");
    expect(res.currency).toBe("TJS");
    expect(res.amount).toBe(1000);
  });
});

describe("Tanzanian Shilling (TZS)", () => {
  test("parses shilling currency name", () => {
    const res = parseMoney("73 shilling");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(73);
  });

  test("parses shillings plural", () => {
    const res = parseMoney("127 shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(127);
  });

  test("parses TZS ISO code before amount", () => {
    const res = parseMoney("TZS 843");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(843);
  });

  test("parses TZS ISO code after amount", () => {
    const res = parseMoney("1234 TZS");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(1234);
  });

  test("parses TZS with decimal", () => {
    const res = parseMoney("TZS 456.78");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(456.78);
  });

  test("parses shilling with decimal", () => {
    const res = parseMoney("99.25 shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(99.25);
  });

  test("parses Tanzanian Shilling with amount in sentence", () => {
    const res = parseMoney("The price is 999 Tanzanian Shilling");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(999);
  });

  test("parses worded number shilling", () => {
    const res = parseMoney("five hundred and sixty-seven shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(567);
  });

  test("parses half shilling", () => {
    const res = parseMoney("half a shilling");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(0.5);
  });

  test("parses one shilling", () => {
    const res = parseMoney("one shilling");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three shillings", () => {
    const res = parseMoney("twenty-three shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand shillings", () => {
    const res = parseMoney("one thousand shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred shillings", () => {
    const res = parseMoney("a hundred shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(100);
  });

  test("parses half million shillings", () => {
    const res = parseMoney("half a million shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter shilling", () => {
    const res = parseMoney("a quarter shilling");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty shillings", () => {
    const res = parseMoney("about fifty shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand shillings", () => {
    const res = parseMoney("around one thousand shillings");
    expect(res.currency).toBe("TZS");
    expect(res.amount).toBe(1000);
  });
});

describe("Thai Baht (THB)", () => {
  test("parses baht currency name", () => {
    const res = parseMoney("73 baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(73);
  });

  test("parses baht plural", () => {
    const res = parseMoney("127 baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(127);
  });

  test("parses THB ISO code before amount", () => {
    const res = parseMoney("THB 843");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(843);
  });

  test("parses THB ISO code after amount", () => {
    const res = parseMoney("1234 THB");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(1234);
  });

  test("parses THB with decimal", () => {
    const res = parseMoney("THB 456.78");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(456.78);
  });

  test("parses baht with decimal", () => {
    const res = parseMoney("99.25 baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(99.25);
  });

  test("parses Thai Baht with amount in sentence", () => {
    const res = parseMoney("The price is 999 Thai Baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(999);
  });

  test("parses worded number baht", () => {
    const res = parseMoney("five hundred and sixty-seven baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(567);
  });

  test("parses half baht", () => {
    const res = parseMoney("half a baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(0.5);
  });

  test("parses one baht", () => {
    const res = parseMoney("one baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three baht", () => {
    const res = parseMoney("twenty-three baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand baht", () => {
    const res = parseMoney("one thousand baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred baht", () => {
    const res = parseMoney("a hundred baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(100);
  });

  test("parses half million baht", () => {
    const res = parseMoney("half a million baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter baht", () => {
    const res = parseMoney("a quarter baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty baht", () => {
    const res = parseMoney("about fifty baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand baht", () => {
    const res = parseMoney("around one thousand baht");
    expect(res.currency).toBe("THB");
    expect(res.amount).toBe(1000);
  });
});

describe("Trinidad & Tobago Dollar (TTD)", () => {
  test("parses dollar currency name", () => {
    const res = parseMoney("73 dollar");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(73);
  });

  test("parses dollars plural", () => {
    const res = parseMoney("127 dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(127);
  });

  test("parses TTD ISO code before amount", () => {
    const res = parseMoney("TTD 843");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(843);
  });

  test("parses TTD ISO code after amount", () => {
    const res = parseMoney("1234 TTD");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(1234);
  });

  test("parses TTD with decimal", () => {
    const res = parseMoney("TTD 456.78");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(456.78);
  });

  test("parses dollar with decimal", () => {
    const res = parseMoney("99.25 dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(99.25);
  });

  test("parses Trinidad & Tobago Dollar with amount in sentence", () => {
    const res = parseMoney("The price is 999 Trinidad & Tobago Dollar");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(999);
  });

  test("parses worded number dollar", () => {
    const res = parseMoney("five hundred and sixty-seven dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(567);
  });

  test("parses half dollar", () => {
    const res = parseMoney("half a dollar");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(0.5);
  });

  test("parses one dollar", () => {
    const res = parseMoney("one dollar");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(1);
  });

  test("parses twenty-three dollars", () => {
    const res = parseMoney("twenty-three dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(23);
  });

  test("parses one thousand dollars", () => {
    const res = parseMoney("one thousand dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(1000);
  });

  test("parses a hundred dollars", () => {
    const res = parseMoney("a hundred dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(100);
  });

  test("parses half million dollars", () => {
    const res = parseMoney("half a million dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(500000);
  });

  test("parses quarter dollar", () => {
    const res = parseMoney("a quarter dollar");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(0.25);
  });

  test("parses about fifty dollars", () => {
    const res = parseMoney("about fifty dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(50);
  });

  test("parses around one thousand dollars", () => {
    const res = parseMoney("around one thousand dollars");
    expect(res.currency).toBe("TTD");
    expect(res.amount).toBe(1000);
  });
});
