declare function require(name:string);
var process = require('process');

/**
 * Encapsulates Smith-Waterman algorithm logic.
 */
class SmithWaterman 
{
    seq1: string;
    seq2: string;
    matchScore: Number;
    mismatchScore: Number;
    gapPenalty: Number;

    constructor(
        seq1: string,
        seq2: string,
        matchScore: Number,
        mismatchScore: Number,
        gapPenalty: Number) 
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
    public Run() 
    {
        var m = this.seq1.length;
        var n = this.seq2.length;

        var H = ArrayHelpers.CreateMatrix(m + 1, n + 1);

        ArrayHelpers.Print(H);
        console.log();

        for(var i: number = 1; i < m + 1; i++) 
        {
            for(var j: number = 1; j < n + 1; j++)
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
                    diagonalScore += H[i - 1][j - 1] + this.mismatchScore;
                }

                H[i][j] = Math.max(verticalScore, horizontalScore, diagonalScore, 0);
            }
        }

        ArrayHelpers.Print(H);
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
    public static CreateMatrix(rows: Number, columns: Number) : Array<any>
    {
        var array = new Array<any>(rows);
        for(var i: number = 0; i < rows; i++)
        {
            array[i] = new Array<Number>(columns).fill(0);
        }

        return array;
    }

    /**
     * Prints a 2D array of numbers.
     */
    public static Print(array: Array<any>)
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
 * Main entry to the program.
 */
function main(): number 
{
    let swRunner = new SmithWaterman("ACGT", "CGT", 2, -2, -3);
    swRunner.Run();
    return 0;
}

main();