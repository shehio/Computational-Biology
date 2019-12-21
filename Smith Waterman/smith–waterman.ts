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
    public Run(): Pair<string>[]
    {
        var H = this.CraftMatrix();
        var longestOccurance = ArrayHelpers.FindMaximum(H);
        this.score = H[longestOccurance.value1][longestOccurance.value2];
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

        // For debugging purposes.
        // ArrayHelpers.Print(H);

        return H;
    }

    private GetSequenceFromStack(stack: Stack<string>): string
    {
        var sequence = "";
        var currentLetter = stack.pop();
        do
        {
            sequence += currentLetter;
            currentLetter = stack.pop();
        } while(currentLetter != undefined)

        return sequence;
    }

    private TraceSequence(H: number[][], longestOccuranceIndex: Pair<number>, stacks: Pair<Stack<string>>): Pair<string>[]
    {
        var row = longestOccuranceIndex.value1;
        var column = longestOccuranceIndex.value2;
        var currentValue = H[row][column];
        var result: Array<Pair<string>> = new Array();

        if (currentValue == 0)
        {
            this.initialPoint = new Pair<number>(row, column);
            var firstSequence = this.GetSequenceFromStack(stacks.value1);
            var secondSequence = this.GetSequenceFromStack(stacks.value2);
            result.push(new Pair<string>(firstSequence, secondSequence));
        }
        else
        {
            // For debugging purposes:
            // console.log(`Row: ${row}, Column: ${column}`);

            var score = 0;
            if (H[row][column] == H[row - 1][column - 1] + this.matchScore)
            {
                var clonedStacks = lo.cloneDeep(stacks);
                clonedStacks.value1.push(this.seq1[row - 1]);
                clonedStacks.value2.push(this.seq2[column - 1]);
                result = result.concat(this.TraceSequence(H, new Pair(row - 1, column - 1), clonedStacks));
            }
            if (H[row][column] == H[row - 1][column] + this.gapPenalty)
            {
                var clonedStacks = lo.cloneDeep(stacks);
                clonedStacks.value1.push(this.seq1[row - 1]);
                clonedStacks.value2.push("v");
                result = result.concat(this.TraceSequence(H, new Pair(row - 1, column), clonedStacks));
            }
            if (H[row][column] == H[row][column - 1] + this.gapPenalty)
            {
                var clonedStacks = lo.cloneDeep(stacks);
                clonedStacks.value1.push("h");
                clonedStacks.value2.push(this.seq2[column - 1]);
                result = result.concat(this.TraceSequence(H, new Pair(row, column - 1), clonedStacks));
            }
            if (H[row][column] == H[row - 1][column - 1] + this.mismatchScore)
            {
                var clonedStacks = lo.cloneDeep(stacks);

                // different formating
                clonedStacks.value1.push("-");
                clonedStacks.value2.push("-");

                // different formating
                // clonedStacks.value1.push(this.seq1[row - 1]);
                // clonedStacks.value2.push(this.seq2[column - 1]);

                result = result.concat(this.TraceSequence(H, new Pair(row - 1, column - 1), clonedStacks));
            }
        }

        return result;
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

function RunSmithWaterman(
    sequence1: string,
    sequence2: string,
    matchScore: number,
    mismatchScore: number,
    gapPenalty: number,
    expectedScore: number,
    expectedInitialRow: number,
    expectedInitialColumn: number)
{
    var swRunner = new SmithWaterman(sequence1, sequence2, matchScore, mismatchScore, gapPenalty);
    
    if (sequence1.length < 20 && sequence2.length < 20)
    {
        console.log(`The input to the function is: ${sequence1} and ${sequence2}`);
    }
    
    console.log(swRunner.Run());
    assert.equal(swRunner.Score, expectedScore);
    assert.equal(swRunner.InitialPoint.value1, expectedInitialRow);
    assert.equal(swRunner.InitialPoint.value2, expectedInitialColumn);
    console.log();
} 

/**
 * Main entry to the program.
 */
function main(): number 
{
    // Verified by http://rna.informatik.uni-freiburg.de/Teaching/index.jsp?toolName=Smith-Waterman
    RunSmithWaterman("GGGGTTTAAAA", "TGGGTGAAAA", 2, -2, -3, 11, 1, 1);

    RunSmithWaterman("TGGGGAAAA", "GGGGTTAAAA", 2, -2, -3, 10, 1, 0);

    RunSmithWaterman("GGGGTTAAAA", "TGGGGAAAA", 2, -2, -3, 10, 0, 1);

    RunSmithWaterman("AATCGCGTGTAA", "GAAGTCTAA", 2, -2, -3, 8, 6, 3);

    RunSmithWaterman("GAAGTCTAA", "AATCGCGTGTAA", 2, -2, -3, 8, 3, 6);

    var lambdaPhage = fs.readFileSync('lambda_virus.fa', 'utf8');

    // Verified by Bowtie2: bowtie2 --local -x lambda_virus -U $BT2_HOME/example/reads/reads_1.fq -S eg3.sam && head eg3.sam

    // line 1 in reads_1.fq
    RunSmithWaterman(
        lambdaPhage,
        "TGAATGCGAACTCCGGGACGCTCAGTAATGTGACGATAGCTGAAAACTGTACGATAAACNGTACGCTGAGGGCAGAAAAAATCGTCGGGGACATTNTAAAGGCGGCGAGCGCGGCTTTTCCG",
        2,
        -2,
        -3,
        232,
        18400,
        0);

    RunSmithWaterman(
        "TGAATGCGAACTCCGGGACGCTCAGTAATGTGACGATAGCTGAAAACTGTACGATAAACNGTACGCTGAGGGCAGAAAAAATCGTCGGGGACATTNTAAAGGCGGCGAGCGCGGCTTTTCCG",
        lambdaPhage,
        2,
        -2,
        -3,
        232,
        0,
        18400);

    // line 5 in reads_1.fq
    RunSmithWaterman(
        lambdaPhage,
        "NTTNTGATGCGGGCTTGTGGAGTTCAGCCGATCTGACTTATGTCATTACCTATGAAATGTGAGGACGCTATGCCTGTACCAAATCCTACAATGCCGGTGAAAGGTGCCGGGATCACCCTGTGGGTTTATAAGGGGATCGGTGACCCCTACGCGAATCCGCTTTCAGACGTTGACTGGTCGCGTCTGGCAAAAGTTAAAGACCTGACGCCCGGCGAACTGACCGCTGAGNCCTATGACGACAGCTATCTCGATGATGAAGATGCAGACTGGACTGC",
        2,
        -2,
        -3,
        526,
        8889,
        4);

    RunSmithWaterman(
        "NTTNTGATGCGGGCTTGTGGAGTTCAGCCGATCTGACTTATGTCATTACCTATGAAATGTGAGGACGCTATGCCTGTACCAAATCCTACAATGCCGGTGAAAGGTGCCGGGATCACCCTGTGGGTTTATAAGGGGATCGGTGACCCCTACGCGAATCCGCTTTCAGACGTTGACTGGTCGCGTCTGGCAAAAGTTAAAGACCTGACGCCCGGCGAACTGACCGCTGAGNCCTATGACGACAGCTATCTCGATGATGAAGATGCAGACTGGACTGC",
        lambdaPhage,
        2,
        -2,
        -3,
        526,
        4,
        8889);

    return 0;
}

main();