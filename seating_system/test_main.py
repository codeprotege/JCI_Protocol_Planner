#!/usr/bin/env python3
## Metadata
# name: Seating Engine Tests
# description: Unit tests for the seating protocol engine categories, ranking logic, and seat ordering.
# dependencies: python>=3.8, unittest

import unittest

from seating_system.main import (
    arrange_seating,
    get_rank,
    is_high_ranking,
    is_jci_member,
    is_local_official,
    is_overseas_delegate,
)


class TestSeatingSystem(unittest.TestCase):
    def test_is_local_official(self):
        self.assertTrue(is_local_official("title", "Government of Hong Kong"))
        self.assertTrue(is_local_official("title", "Some HK Organization"))
        self.assertFalse(is_local_official("title", "Government of USA"))

    def test_is_high_ranking(self):
        self.assertTrue(is_high_ranking("Chief Executive of HKSAR"))
        self.assertFalse(is_high_ranking("Director of a Bureau"))

    def test_is_jci_member(self):
        self.assertTrue(is_jci_member("JCI Hong Kong"))
        self.assertFalse(is_jci_member("Some Company"))

    def test_is_overseas_delegate(self):
        self.assertTrue(is_overseas_delegate("JCI Japan"))
        self.assertFalse(is_overseas_delegate("JCI Hong Kong"))
        self.assertFalse(is_overseas_delegate("Any other org"))

    def test_get_rank(self):
        jci_member = {"name": "Test Member", "organization": "JCI HK", "number": 50}
        goh_high = {"name": "High GOH", "title": "GOH, Chief Executive", "organization": "Government of Hong Kong"}
        goh_secondary = {"name": "Secondary GOH", "title": "GOH, Director", "organization": "Government of Hong Kong"}
        guest = {"name": "Guest", "title": "Guest", "organization": "Some Company"}

        self.assertEqual(get_rank(jci_member), 50)
        self.assertEqual(get_rank(goh_high), 0)
        self.assertEqual(get_rank(goh_secondary), 1)
        self.assertEqual(get_rank(guest), 999)

    def test_seating_arrangement(self):
        attendees = [
            {"name": "Local GOH High", "title": "GOH, Chief Executive", "organization": "Government of Hong Kong"},
            {"name": "Foreign GOH", "title": "GOH", "organization": "Government of USA"},
            {"name": "Local GOH Secondary", "title": "GOH, Director", "organization": "Government of Hong Kong"},
            {"name": "Local Guest", "title": "Guest", "organization": "Some Local Company"},
            {"name": "Overseas Delegate", "title": "Delegate", "organization": "JCI Japan"},
        ]

        seating = arrange_seating(attendees)

        self.assertEqual(seating[1]["name"], "Local GOH High")
        self.assertEqual(seating[3]["name"], "Foreign GOH")
        self.assertEqual(seating[2]["name"], "Local GOH Secondary")
        self.assertEqual(seating[5]["name"], "Local Guest")
        self.assertEqual(seating[4]["name"], "Overseas Delegate")
        self.assertEqual(seating[6]["name"], "Senator Rafael Wong")
        self.assertEqual(seating[7]["name"], "Senator Ben Mak")


if __name__ == "__main__":
    unittest.main()
