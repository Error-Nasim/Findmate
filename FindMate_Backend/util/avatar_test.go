package util

import "testing"

func TestComputeAvatar(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Abu Nasim", "AN"},
		{"Rimon Chandra Bhowmik", "RC"},
		{"Al Imtiaz", "AI"},
		{"John", "JO"},
		{"x", "X"},
		{"", "U"},
		{"   ", "U"},
		{"Tanvir Ahmed", "TA"},
	}

	for _, tc := range tests {
		actual := ComputeAvatar(tc.input)
		if actual != tc.expected {
			t.Errorf("ComputeAvatar(%q) = %q; expected %q", tc.input, actual, tc.expected)
		}
	}
}
