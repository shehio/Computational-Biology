declare function require(name:string);
var process = require('process');
var assert = require('assert');
var fs = require('fs');
var plotly = require('plotly')("shehio", "nOqjkyGfnNMgg1F59AWm")

/**
 * Main entry to the program.
 */
function main(): number 
{
    var lambdaPhage = fs.readFileSync('lambda_virus.fa', 'utf8');
    console.log(`The length of lambda phage virus genome is: ${lambdaPhage.length}`)

    var readFile = fs.readFileSync('reads_1.fq', 'utf8');
    var lines = readFile.toString().split('\n');
    var reads = Math.floor(lines.length / 4);
    console.log(`There are ${reads} reads in this read file.`);

    var minLength = Number.MAX_SAFE_INTEGER;
    var maxLength = 0;
    var averageLength = 0.0;

    var sequences = new Map<string, number>();
    
    for (var i: number = 1; i < lines.length; i = i + 4)
    {
        var read = lines[i];
        var lineLength = read.length;
        minLength = Math.min(minLength, lineLength);
        maxLength = Math.max(maxLength, lineLength);
        averageLength += lineLength / reads;

        for (var j: number = 1; j < read.length - 20; j++)
        {
            var sequence = read.substring(j, j + 20);

            if (sequences.has(sequence))
            {
                sequences.set(sequence, sequences.get(sequence) + 1);
            }
            else
            {
                sequences.set(sequence, 1);
            }
        }
    }

    console.log(`The minimum length of reads is: ${minLength}.`);
    console.log(`The maximum length of reads is: ${maxLength}.`);
    console.log(`The average length of reads is: ${averageLength}.`);

    var sequenceLengths = Array.from(sequences.values());
    var data =
    [
        {
            x: sequenceLengths,
            type: "histogram"
        }
    ];

    var graphOptions = {filename: "basic-histogram", fileopt: "overwrite"};
    plotly.plot(data, graphOptions, function (err, msg) 
    {
        console.log(msg);
    });

    return 0;
}

main();