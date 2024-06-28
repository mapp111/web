import dataPoint from '../model/dataPoint';
import divideDataPoint from '../model/dataPoint';
import replaceDataPoint from '../model/dataPoint';

export function initializeTest(){
    let array = [
        new dataPoint(12,'B','value'),
        new replaceDataPoint(30,'C','replace','.','tr',true),
        new dataPoint(46,'E','value'),
        new dataPoint(63,'D','value'),
        new dataPoint(78,'A','value'),
        new dataPoint(93,'G','value'),
        new dataPoint(109,'H','value'),
        new dataPoint(114,'I','value'),
        new divideDataPoint(128,'J','divider','/',1),
        new divideDataPoint(141,'J','divider','/',2),
        new divideDataPoint(157,'K','divider','/',1),
        new divideDataPoint(172,'K','divider','/',2),
        new divideDataPoint(199,'K','divider','/',3),
        new dataPoint(211,'L','value'),
        new dataPoint(227,'M','value')
    ]
    return array;
}