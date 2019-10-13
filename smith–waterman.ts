declare function require(name:string);
var process = require('process');
var assert = require('assert');
var fs = require('fs');
var lo = require('lodash');

/**
 * Encapsulates Smith-Waterman algorithm logic.
 */
class SmithWaterman 
{
    seq1: string;
    seq2: string;
    matchScore: number;
    mismatchScore: number;
    gapPenalty: number;

    private score: number = 0;

    public get Score(): number 
    {
        return this.score;
    }

    private initialPoint: Pair<number>;

    public get InitialPoint(): Pair<number> 
    {
        return this.initialPoint;
    }

    constructor(
        seq1: string,
        seq2: string,
        matchScore: number,
        mismatchScore: number,
        gapPenalty: number) 
    {
        this.seq1 = seq1;
        this.seq2 = seq2;
        this.matchScore = matchScore;
        this.mismatchScore = mismatchScore;
        this.gapPenalty = gapPenalty;
    }

    /**
     * Runs Smith-Waterman algorithm to perform local sequence alignment.
     */
    public Run(): string[]
    {
        var H = this.CraftMatrix();
        this.score = H[H.length - 1][H[0].length - 1];
        var longestOccurance = ArrayHelpers.FindMaximum(H);
        var localAlignments = this.TraceSequence(H, longestOccurance, new Pair<Stack<string>>(new Stack<string>(), new Stack<string>()));
        return localAlignments;
    }

    private CraftMatrix() : number[][]
    {
        var m = this.seq1.length;
        var n = this.seq2.length;
        var H = ArrayHelpers.CreateMatrix(m + 1, n + 1);

        for (var i: number = 1; i < m + 1; i++) 
        {
            for (var j: number = 1; j < n + 1; j++)
            {
                var char1 = this.seq1[i - 1];
                var char2 = this.seq2[j - 1];
                
                var verticalScore = H[i - 1][j] + this.gapPenalty;
                var horizontalScore = H[i][j - 1] + this.gapPenalty;
                var diagonalScore = 0;

                if (char1 == char2)
                {
                    diagonalScore = H[i - 1][j - 1] + this.matchScore;
                }
                else
                {
                    diagonalScore = H[i - 1][j - 1] + this.mismatchScore;
                }

                H[i][j] = Math.max(verticalScore, horizontalScore, diagonalScore, 0);
            }
        }

        ArrayHelpers.Print(H);

        return H;
    }

    private TraceSequence(H: number[][], longestOccuranceIndex: Pair<number>, stacks: Pair<Stack<string>>): string[]
    {
        var row = longestOccuranceIndex.value1;
        var column = longestOccuranceIndex.value2;
        var currentValue = H[row][column];
        var ret: Array<string> = new Array();

        if (currentValue == 0)
        {
            this.initialPoint = new Pair<number>(row, column);

            var firstStack = stacks.value1;
            var sequence = "";
            var currentLetter = firstStack.pop();
            do
            {
                sequence += currentLetter;
                currentLetter = firstStack.pop();
            } while(currentLetter != undefined)

            // console.log(sequence);

            ret.push(sequence);

            // Move this into a function.
            var secondStack = stacks.value2;
            sequence = "";
            var currentLetter = secondStack.pop();
            do
            {
                sequence += currentLetter;
                currentLetter = secondStack.pop();
            } while(currentLetter != undefined)

            // console.log(sequence);
            
            ret.push(sequence);
        }
        else
        {
            // For debugging purposes:
            console.log(`Row: ${row}, Column: ${column}`);

            if (H[row][column] == H[row - 1][column - 1] + this.matchScore)
            {
                console.log("case 1:");
                var clonedStacks = lo.cloneDeep(stacks);
                clonedStacks.value1.push(this.seq1[row - 1]);
                clonedStacks.value2.push(this.seq2[column - 1]);
                var result1 = this.TraceSequence(H, new Pair(row - 1, column - 1), clonedStacks);
                // console.log(result1);
                ret = ret.concat(result1);
                // console.log(ret);
            }
            if (H[row][column] == H[row - 1][column] + this.gapPenalty)
            {
                console.log("case 2:");
                var clonedStacks = lo.cloneDeep(stacks);
                clonedStacks.value1.push(this.seq1[row - 1]);
                clonedStacks.value2.push("h");
                var result2 = this.TraceSequence(H, new Pair(row - 1, column), clonedStacks);
                // console.log(result2);
                ret = ret.concat(result2);
            }
            if (H[row][column] == H[row][column - 1] + this.gapPenalty)
            {
                console.log("case 3:");
                var clonedStacks = lo.cloneDeep(stacks);
                clonedStacks.value2.push(this.seq1[column - 1]);
                clonedStacks.value1.push("v");
                var result3 = this.TraceSequence(H, new Pair(row, column - 1), clonedStacks);
                // console.log(result3);
                ret = ret.concat(result3);
            }
            if (H[row][column] == H[row - 1][column - 1] + this.mismatchScore)
            {
                console.log("case 4:");
                var clonedStacks = lo.cloneDeep(stacks);
                // clonedStacks.value1.push("-");
                // clonedStacks.value2.push("-");

                clonedStacks.value1.push(this.seq1[row - 1]);
                clonedStacks.value2.push(this.seq2[column - 1]);

                var result4 = this.TraceSequence(H, new Pair(row - 1, column - 1), clonedStacks);
                // console.log(result4);
                ret = ret.concat(result4);
            }
        }

        return ret;
    }
}

/**
 * A utility class for Arrays.
 */
class ArrayHelpers
{
    /**
     * Creates a 2D array of numbers. All entries are
     * initialized to zero.
     */
    public static CreateMatrix(rows: Number, columns: Number) : number[][]
    {
        var array = new Array<any>(rows);
        for(var i: number = 0; i < rows; i++)
        {
            array[i] = new Array<Number>(columns).fill(0);
        }

        return array;
    }

    /**
     * Returns the index of the maximum element in a 2D array.
     * If two elements are the same, it returns the one that
     * occured first.
     */
    public static FindMaximum(array: number[][]) : Pair<number> 
    {
        var max: number = Number.MIN_SAFE_INTEGER;
        var pair: Pair<number> = new Pair(0, 0);
        for(var i: number = 0; i < array.length; i++) 
        {
            for(var j: number = 0; j < array[0].length; j++)
            {
                if (array[i][j] > max)
                {
                    max = array[i][j];
                    pair = new Pair(i, j);
                }
            }
        }

        return pair;
    }

    /**
     * Prints a 2D array of numbers.
     */
    public static Print(array: number[][])
    {
        for(var i: number = 0; i < array.length; i++) 
        {
            for(var j: number = 0; j < array[0].length; j++)
            {
                process.stdout.write(array[i][j] + " ");
            }
            console.log();
        }
    }
}

/**
 * An implementation of a templated stack.
 * Taken from basarat.gitbooks.io.
 */
class Stack<T> 
{
    store: T[] = [];

    push(val: T) 
    {
      this.store.push(val);
    }

    pop(): T | undefined 
    {
      return this.store.pop();
    }
  }

/**
 * Encapsulates a pair of values.
 */
class Pair<T>
{
    value1: T;
    value2: T;
    constructor(value1: T, value2: T) 
    {
        this.value1 = value1;
        this.value2 = value2;
    }

    public ToString()
    {
        return `(${this.value1}, ${this.value2})`;
    }
}

/**
 * Main entry to the program.
 */
function main(): number 
{
    let swRunner = new SmithWaterman("GGGGTTTAAAA", "TGGGTGAAAA", 2, -2, -3);
    // assert.equal("GGGGTTAAAA", swRunner.Run());
    console.log(swRunner.Run());
    // assert.equal(10, swRunner.Score);
    // assert.equal(0, swRunner.InitialPoint.value1);
    // assert.equal(1, swRunner.InitialPoint.value2);
    console.log();

    // swRunner = new SmithWaterman("TGGGGAAAA", "GGGGTTAAAA", 2, -2, -3);
    // assert.equal("GGGGTTAAAA", swRunner.Run());
    // assert.equal(10, swRunner.Score);
    // assert.equal(1, swRunner.InitialPoint.value1);
    // assert.equal(0, swRunner.InitialPoint.value2);
    // console.log();

    // swRunner = new SmithWaterman("AATCGCGTGTAA", "GAAGTCTAA", 2, -2, -3);
    // console.log(swRunner.Run());
    // assert.equal("GT-TAA", swRunner.Run());
    // assert.equal(8, swRunner.Score);
    // assert.equal(6, swRunner.InitialPoint.value1);
    // assert.equal(3, swRunner.InitialPoint.value2);

    // swRunner = new SmithWaterman("GAAGTCTAA", "AATCGCGTGTAA", 2, -2, -3);
    // assert.equal("GT-TAA", swRunner.Run());
    // assert.equal(8, swRunner.Score);
    // assert.equal(3, swRunner.InitialPoint.value1);
    // assert.equal(6, swRunner.InitialPoint.value2);

    // var lambdaPhage = fs.readFileSync('lambda_virus.fa', 'utf8');

    // swRunner = new SmithWaterman(lambdaPhage, "TGAATGCGAACTCCGGGACGCTCAGTAATGTGACGATAGCTGAAAACTGTACGATAAACNGTACGCTGAGGGCAGAAAAAATCGTCGGGGACATTNTAAAGGCGGCGAGCGCGGCTTTTCCG", 2, -2, -3);
    // assert.equal("TGAATGCGAACTCCGGGACGCTCAGTAATGTGACGATAGCTGAAAACTGTACGATAAAC-GTACGCTGAGGGC-GAAAAAATCGTCGGGGACATT-TAAAGGCGGCGAGCGCGGCTTTTCCG", swRunner.Run());
    // assert.equal(8, swRunner.Score);
    // assert.equal(18400, swRunner.InitialPoint.value1);
    // assert.equal(0, swRunner.InitialPoint.value2);

    // swRunner = new SmithWaterman("TGAATGCGAACTCCGGGACGCTCAGTAATGTGACGATAGCTGAAAACTGTACGATAAACNGTACGCTGAGGGCAGAAAAAATCGTCGGGGACATTNTAAAGGCGGCGAGCGCGGCTTTTCCG", lambdaPhage, 2, -2, -3);
    // assert.equal("TGAATGCGAACTCCGGGACGCTCAGTAATGTGACGATAGCTGAAAACTGTACGATAAAC-GTACGCTGAGGGC-GAAAAAATCGTCGGGGACATT-TAAAGGCGGCGAGCGCGGCTTTTCCG", swRunner.Run());
    // assert.equal(8, swRunner.Score);
    // assert.equal(0, swRunner.InitialPoint.value1);
    // assert.equal(18400, swRunner.InitialPoint.value2);
    
    // swRunner = new SmithWaterman(lambdaPhage, "NTTNTGATGCGGGCTTGTGGAGTTCAGCCGATCTGACTTATGTCATTACCTATGAAATGTGAGGACGCTATGCCTGTACCAAATCCTACAATGCCGGTGAAAGGTGCCGGGATCACCCTGTGGGTTTATAAGGGGATCGGTGACCCCTACGCGAATCCGCTTTCAGACGTTGACTGGTCGCGTCTGGCAAAAGTTAAAGACCTGACGCCCGGCGAACTGACCGCTGAGNCCTATGACGACAGCTATCTCGATGATGAAGATGCAGACTGGACTGC", 2, -2, -3);
    // assert.equal("TGATGCGGGCTTGTGGAGTTCAGCCGATCTGACTTATGTCATTACCTATGAAATGTGAGGACGCTATGCCTGTACCAAATCCTACAATGCCGGTGAAAGGTGCCGGGA-CACCCTGTGGGTTTATAAGGGGA-CGGTGACCC-TACGCGAATCCGCTTTCAGACGTTGACTGGTCGCGTCTGGCAAAAGTTAAAGACCTGACGCCCGGCGAACTGACCGCTGAG-CCTATGACGACAGCTATCTCGATGATGAAGATGCAGACTGGACTGC", swRunner.Run());
    // assert.equal(5, swRunner.Score);
    // assert.equal(8889, swRunner.InitialPoint.value1);
    // assert.equal(4, swRunner.InitialPoint.value2);

    // swRunner = new SmithWaterman("NTTNTGATGCGGGCTTGTGGAGTTCAGCCGATCTGACTTATGTCATTACCTATGAAATGTGAGGACGCTATGCCTGTACCAAATCCTACAATGCCGGTGAAAGGTGCCGGGATCACCCTGTGGGTTTATAAGGGGATCGGTGACCCCTACGCGAATCCGCTTTCAGACGTTGACTGGTCGCGTCTGGCAAAAGTTAAAGACCTGACGCCCGGCGAACTGACCGCTGAGNCCTATGACGACAGCTATCTCGATGATGAAGATGCAGACTGGACTGC", lambdaPhage, 2, -2, -3);
    // assert.equal("TGATGCGGGCTTGTGGAGTTCAGCCGATCTGACTTATGTCATTACCTATGAAATGTGAGGACGCTATGCCTGTACCAAATCCTACAATGCCGGTGAAAGGTGCCGGGA-CACCCTGTGGGTTTATAAGGGGA-CGGTGACCC-TACGCGAATCCGCTTTCAGACGTTGACTGGTCGCGTCTGGCAAAAGTTAAAGACCTGACGCCCGGCGAACTGACCGCTGAG-CCTATGACGACAGCTATCTCGATGATGAAGATGCAGACTGGACTGC", swRunner.Run());
    // assert.equal(5, swRunner.Score);
    // assert.equal(4, swRunner.InitialPoint.value1);
    // assert.equal(8889, swRunner.InitialPoint.value2);

    return 0;
}

main();