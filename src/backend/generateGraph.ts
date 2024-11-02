console.log("Ugh I have to remember Typescript again...")

enum EntranceAccessibility {
    "Inaccessible",
    "Accessible",
    "Other",
}

class Warp {

}

function entranceAccessible(entrance: Warp) : EntranceAccessibility {
    return EntranceAccessibility.Other
}
// Parameters:
// location: String representation of an entrance
// Returns enum EntranceAccessibility
// Location is both accessible and has been taken = 2
// Location is currently accessible based on current data (graph?) = 1
// Location is not currently accessible based on current data = 0

// checkAccessible(check: string)
// Parameters:
// check: String representation of a check
// Returns enum CheckAccessibility
// Check has been received = 2 (backend should not be concerned with the frontend information of whether it was received)
// (optional) special cases for is accessible but not in logic e.g. (2+)
// Check is currently accessible based on current data (graph?) = 1
// Check is not currently accessible based on current data = 0

// shortestPath(startRegion: string, endRegion: string)
// Parameters:
// endRegion: String representation of a location
// Returns Array<String>
// Ordered array of string locations to enter to arrive at endLoc, starting with the first warp (NOT the starting location) and ending with the final warp (endRegion), length-1 array containing just location if at location
