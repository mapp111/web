export class dataPoint {
    constructor(index, col, type) {
        this.index = index;
        this.col = col;
        this.type = type;
    }
}
export class divideDataPoint extends dataPoint{
    constructor(index, col, type, separator, location){
        super(index, col, type);
        this.separator = separator;
        this.location = location;
    }
}
export class replaceDataPoint extends dataPoint{
    constructor(index, col, type, separator, target, useZeroRemover){
        super(index, col, type);
        this.separator = separator;
        this.target = target;
        this.useZeroRemover = useZeroRemover;
    }
}