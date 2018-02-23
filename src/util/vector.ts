namespace hp {
  export class vector {

    public static get zero(): vector {
      return new vector(0, 0)
    }

    public static get one(): vector {
      return new vector(1, 1)
    }

    public static get left(): vector {
      return new vector(-1, 0)
    }

    public static get right(): vector {
      return new vector(1, 0)
    }

    public static get up(): vector {
      return new vector(0, -1)
    }

    public static get down(): vector {
      return new vector(0, 1)
    }

    public static get infinity(): vector {
      return new vector(Infinity, Infinity)
    }

    public static get pi(): vector {
      return new vector(Math.PI, Math.PI)
    }

    public static get negativePi(): vector {
      return new vector(Math.PI * -1, Math.PI * -1)
    }

    public static get negativeInfinity(): vector {
      return new vector(Infinity * -1, Infinity * -1)
    }

    public get normalized(): vector {
      let ratio = Math.max(this.x, this.y) / 1
      let numbers = [this.x, this.y]
      for (let i = 0; i < 2; i++) {
        numbers[i] = parseFloat((numbers[i] / ratio).toFixed(2));
      }
      return new vector(numbers[0], numbers[1])
    }

    public constructor(public readonly x: number, public readonly y: number) {

    }

    /**
     * Adds to both x and y by a number
     *
     * @param {number} amount
     * @returns
     * @memberof vector
     */
    public plus(amount: number) {
      return new vector(this.x + amount, this.y + amount)
    }

    /**
     * Subtracts both x and y by a number
     *
     * @param {number} amount
     * @returns
     * @memberof vector
     */
    public minus(amount: number) {
      return new vector(this.x - amount, this.y - amount)
    }

    /**
     * Multiplies both x and y by a number
     *
     * @param {number} amount
     * @returns
     * @memberof vector
     */
    public times(amount: number) {
      return new vector(this.x * amount, this.y * amount)
    }

    /**
     * Divides both x and y by a number
     *
     * @param {number} amount
     * @returns
     * @memberof vector
     */
    public divide(amount: number) {
      return new vector(this.x / amount, this.y / amount)
    }

    /**
     * Gets the distance between two points.
     * The number will always be positive.
     *
     * @param {vector} vector
     * @returns {number}
     * @memberof vector
     */
    public distance(vector: vector): number
    public distance(x: number, y: number): number
    public distance(...args: any[]) {
      let x = 0, y = 0
      if (args.length == 2) {
        x = args[0], y = args[1]
      } else if (args[0] instanceof vector) {
        x = args[0].x, y = args[0].y
      }
      let a = this.x - x
      let b = this.y - y
      return Math.abs(Math.sqrt(a * a + b * b))
    }
  }
}