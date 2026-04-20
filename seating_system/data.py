import json

jci_hk_recognition_list = {
  "JCIHK_Recognition_List_2025": {
    "recognition_order": [
      {
        "number": 1,
        "title": "National President",
        "name": "Senator Rafael Wong"
      },
      {
        "number": 2,
        "title": "JCI Vice President, Senate Chairman and National Immediate Past President",
        "name": "Senator Ben Mak"
      },
      {
        "number": 3,
        "title": "1988 JCI President",
        "name": "Senator Jennifer Yu"
      },
      {
        "number": 4,
        "title": "JCI Honorary Advisor and 1979 National President",
        "name": "Senator Sonny Yu"
      },
      {
        "number": 5,
        "title": "JCI Advisory Board Chairperson, HKJC Foundation Chairman and 2008 National President",
        "name": "Senator Eric Tang"
      },
      {
        "number": 6,
        "title": "JCI Foundation Director, JCI Hong Kong, China Panel of Advisors and 2006 National President",
        "name": "Senator Dr James Tsui, MH"
      },
      {
        "number": 7,
        "title": "JCI Audit Committee Chairperson and 2015 National President",
        "name": "Senator Anthony Leung"
      },
      {
        "number": 8,
        "title": "JCI Global Collaboration Committee Chairperson",
        "name": "Senator Lucy Jiang"
      },
      {
        "number": 9,
        "title": "JCI Skills Development Committee Member (Asia and the Pacific)",
        "name": "Senator Claudia Chor"
      },
      {
        "number": 10,
        "title": "JCI Asia Pacific Senate Secretary General",
        "name": "Senator Licca Chan"
      },
      {
        "number": 11,
        "title": "JCI Asia Pacific Senate Director, JCI Hong Kong, China National Presidential Advisor and 2013 National President",
        "name": "Senator Paul Wu"
      },
      {
        "number": 12,
        "title": "JCI Asia Pacific Development Council Councilor",
        "name": "Senator Vincy Wong"
      },
      {
        "number": 13,
        "title": "JCI Hong Kong, China Panel of Advisors and 1976 National President",
        "name": "Senator Paul Yin, SBS, JP"
      },
      {
        "number": 14,
        "title": "JCI Hong Kong, China Panel of Advisors and 1980 National President",
        "name": "Senator Major Tang"
      },
      {
        "number": 15,
        "title": "JCI Hong Kong, China Panel of Advisors and 1991 National President",
        "name": "Senator Daniel Cham, BBS, MH, BH, JP"
      },
      {
        "number": 16,
        "title": "JCI Hong Kong, China Panel of Advisors and 1993 National President",
        "name": "Senator George Lung, SBS, MH, JP"
      },
      {
        "number": 17,
        "title": "Ten Outstanding Young Persons Selection Steering Committee Chairman and 1984 National President",
        "name": "Senator John Chan"
      },
      {
        "number": 18,
        "title": "Strategic Planning Committee Chairman and 2010 National President",
        "name": "Senator Gene Tang"
      },
      {
        "number": 19,
        "title": "(Other Past National Presidents by seniority)",
        "name": None
      },
      {
        "number": 20,
        "title": "JCI Hong Kong, China Alumni Club Chairman",
        "name": "Senator Redi Choi"
      },
      {
        "number": 21,
        "title": "National General Legal Counsel",
        "name": "Evan Leung"
      },
      {
        "number": 22,
        "title": "National Executive Vice President",
        "name": "Senator Michele Lau"
      },
      {
        "number": 23,
        "title": "National Executive Vice President",
        "name": "Christopher Lam"
      },
      {
        "number": 24,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Senator Mic Hon"
      },
      {
        "number": 25,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Senator Dixon Kwok"
      },
      {
        "number": 26,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Senator Wallace Sham"
      },
      {
        "number": 27,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Senator Bon Tang"
      },
      {
        "number": 28,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Senator Elaine Tang"
      },
      {
        "number": 29,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Senator Davina Wong"
      },
      {
        "number": 30,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Christy Chan"
      },
      {
        "number": 31,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Zion Fu"
      },
      {
        "number": 32,
        "title": "National Vice President (National Assigned Executive Officer)",
        "name": "Priscilla Tso"
      },
      {
        "number": 33,
        "title": "National Secretary General (National Assigned Executive Officer)",
        "name": "Karen Lo"
      },
      {
        "number": 34,
        "title": "National Honorary Treasurer (National Assigned Executive Officer)",
        "name": "Alan Ho"
      },
      {
        "number": 35,
        "title": "National Business Affairs Director",
        "name": "Crystal Tsang"
      },
      {
        "number": 36,
        "title": "National Civic Engagement Director",
        "name": "Skyer Yiu"
      },
      {
        "number": 37,
        "title": "National Corporate Communications Director",
        "name": "Gilbert Sun"
      },
      {
        "number": 38,
        "title": "National Digital Marketing & Publication Director",
        "name": "Rachel Leung"
      },
      {
        "number": 39,
        "title": "National International Affairs Director",
        "name": "Chris Ng"
      },
      {
        "number": 40,
        "title": "National Leadership Development Director",
        "name": "Kelvin Cheung"
      },
      {
        "number": 41,
        "title": "National Mainland Affairs Director",
        "name": "William Chan"
      },
      {
        "number": 42,
        "title": "National Membership Director",
        "name": "Vivian Wong"
      },
      {
        "number": 43,
        "title": "National Records & Recognition Director and JCI Tai Ping Shan President Candidate",
        "name": "Janet Wong"
      },
      {
        "number": 44,
        "title": "National Youth & Sustainability Development Director",
        "name": "Kuri Wong"
      },
      {
        "number": 45,
        "title": "National Civic Engagement Commission Chairman",
        "name": "Jasmine Lam"
      },
      {
        "number": 46,
        "title": "National Digital Marketing Commission Chairman",
        "name": "Mandy Law"
      },
      {
        "number": 47,
        "title": "National Foreign Affairs Commission Chairman",
        "name": "Senator Dara Sum"
      },
      {
        "number": 48,
        "title": "National International Affairs Commission Chairman",
        "name": "Senator Hob Lau"
      },
      {
        "number": 49,
        "title": "National JCI In Business Commission Chairman",
        "name": "Fung Kong"
      },
      {
        "number": 50,
        "title": "National Mainland Affairs Commission Chairman",
        "name": "Ann Fok"
      },
      {
        "number": 51,
        "title": "National Membership Development Commission Chairman",
        "name": "Senator Waynes Seto"
      },
      {
        "number": 52,
        "title": "National Membership Extension Commission Chairman",
        "name": "Ewan Siu"
      },
      {
        "number": 53,
        "title": "National Partnership & Sponsorship Affairs Commission Chairman",
        "name": "Senator Leo Hung"
      },
      {
        "number": 54,
        "title": "National Publication Commission Chairman",
        "name": "Senator Amy Li"
      },
      {
        "number": 55,
        "title": "National Training & Development Commission Chairman",
        "name": "Senator Hei Leung"
      },
      {
        "number": 56,
        "title": "National Youth & Sustainability Development Commission Chairman",
        "name": "Senator Dorothy Chan"
      },
      {
        "number": 57,
        "title": "2025 Ten Outstanding Young Persons Selection Chairman",
        "name": "Senator Daryl Lin"
      },
      {
        "number": 58,
        "title": "JCIHK 75th Anniversary Chairman",
        "name": "Senator Carol Wong"
      },
      {
        "number": 59,
        "title": "The 60th JCIHK National Convention Director",
        "name": "Austin Cheung"
      },
      {
        "number": 60,
        "title": "2025 JCIHK Inaugural Ceremony Chairman",
        "name": "Senator Yannes Wong"
      },
      {
        "number": 61,
        "title": "2025 Asia-Pacific Youth Micro Movie Festival Chairman",
        "name": "Edward Ng"
      },
      {
        "number": 62,
        "title": "JCI Victoria President",
        "name": "Jay Lee"
      },
      {
        "number": 63,
        "title": "JCI Kowloon President",
        "name": "Michael Lau"
      },
      {
        "number": 64,
        "title": "JCI Island President",
        "name": "Alvin Wong"
      },
      {
        "number": 65,
        "title": "JCI Peninsula President",
        "name": "Jenny Fong"
      },
      {
        "number": 66,
        "title": "JCI Hong Kong Jayceettes President",
        "name": "Rycho Cheuk"
      },
      {
        "number": 67,
        "title": "JCI Lion Rock President",
        "name": "Huey Shum"
      },
      {
        "number": 68,
        "title": "JCI Harbour President",
        "name": "Ko Chi Wah"
      },
      {
        "number": 69,
        "title": "JCI Yuen Long President",
        "name": "Jacky Wong"
      },
      {
        "number": 70,
        "title": "JCI Tai Ping Shan President",
        "name": "Michelle Yu"
      },
      {
        "number": 71,
        "title": "JCI Bauhinia President",
        "name": "Jenny Leung"
      },
      {
        "number": 72,
        "title": "JCI Dragon President",
        "name": "Bosco Li"
      },
      {
        "number": 73,
        "title": "JCI East Kowloon President",
        "name": "Ryan Kuo"
      },
      {
        "number": 74,
        "title": "JCI City President",
        "name": "Pong Tong"
      },
      {
        "number": 75,
        "title": "JCI Queensway President",
        "name": "Coeus Leung"
      },
      {
        "number": 76,
        "title": "JCI North District President",
        "name": "Dickson Kwok"
      },
      {
        "number": 77,
        "title": "JCI Ocean President",
        "name": "Kevin Chu"
      },
      {
        "number": 78,
        "title": "JCI Sha Tin President",
        "name": "Randy Lee"
      },
      {
        "number": 79,
        "title": "JCI Apex President",
        "name": "Steven Chow"
      },
      {
        "number": 80,
        "title": "JCI City Lady President",
        "name": "Ecquinne Yu"
      },
      {
        "number": 81,
        "title": "JCI Tsuen Wan President",
        "name": "Francis Kwan"
      },
      {
        "number": 82,
        "title": "JCI Lantau President",
        "name": "James Li"
      }
    ],
    "notes": [
      "The above order of precedence of the recognition is based on the hierarchy of the organization.",
      "All DESIGNATED officers in the JCI (current and then past) follow the National President. For the current appointed posts in the JCI, only the ones with SUBSTANTIAL positions in the Board/Commission will be recognized.",
      "For other National officers, the order of precedence of recognition is according to the seniority of position and position name in alphabetical order if same position level. In the case of the ones with the same position, they will be recognized in senatorship and then the surnames in alphabetical order.",
      "In case past JCI Officers attend the function, we may recognize their presence."
    ]
  }
}
