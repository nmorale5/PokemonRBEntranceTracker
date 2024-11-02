export enum EntranceAccessibility {
    "Inaccessible",
    "Accessible",
    "Other",
}

export enum CheckAccessibility {
    "Inaccessible",
    "Accessible",
    "Other",
}

export class Warp {

}

export function entranceAccessible(entrance: Warp) : EntranceAccessibility {
    /**
     * Parameters:
     *  Warp: Representation of an entrance
     * Returns enum EntranceAccessibility
     */
    return EntranceAccessibility.Other;
}

export function checkAccessible(check: string) : CheckAccessibility {
    /**
     * Parameters:
     *  check: Respresentation of a check
     * Return enum CheckAccessibility
     */
    return CheckAccessibility.Other;
}

export function shortestPath(startRegion: string, endRegion: string) : Array<string> {
    /**
     * Parameters:
     *  startRegion: start region string
     *  endRegion: destination region string
     * Returns: Ordered array of string locations to enter to arrive at endLoc, not including startLoc
     */
    return [];
}