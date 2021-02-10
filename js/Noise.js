//https://github.com/gdcbyers/noisy/blob/master/lib/noisy/noisy.rb
export default class Noise {
  constructor(seed, octaves) {
    this.seed = seed;
    this.octaves = octaves;
    this.persistence = 0.25;
    this.cache = {};
  }

  raw_noise(x) {
    var xi = Math.floor(x);
    var n = (xi << 13) ^ xi;
    return (
      1.0 -
      ((n * (n * n * 15731 * this.seed + 789221 * this.seed) +
        1376312589 * this.seed) &
        0x7fffffff) /
        1073741824.0
    );
  }

  raw_noise_2d(x, y) {
    if (this.cache[x + "," + y] !== undefined) {
      return this.cache[x + "," + y];
    }
    var n = Math.floor(x + y * 57);
    n = (n << 13) ^ n;
    var result =
      1.0 -
      ((n * (n * n * 15731 * this.seed + 789221 * this.seed) +
        1376312589 * this.seed) &
        0x7fffffff) /
        1073741824.0;
    this.cache[x + "," + y] = result;
    return result;
  }

  smooth_noise(x) {
    var left = this.raw_noise(x - 1.0);
    var right = this.raw_noise(x + 1.0);
    return this.raw_noise(x) / 2 + left / 4 + right / 4;
  }

  smooth_noise_2d(x, y) {
    var corners =
      this.raw_noise_2d(x - 1, y - 1) +
      this.raw_noise_2d(x - 1, y + 1) +
      this.raw_noise_2d(x + 1, y - 1) +
      this.raw_noise_2d(x + 1, y + 1);
    var sides =
      this.raw_noise_2d(x, y - 1) +
      this.raw_noise_2d(x, y + 1) +
      this.raw_noise_2d(x - 1, y) +
      this.raw_noise_2d(x + 1, y);
    var center = this.raw_noise_2d(x, y);
    return center / 4 + sides / 8 + corners / 16;
  }

  linear_interpolate(a, b, x) {
    return a * (1 - x) + b * x;
  }

  cosine_interpolate(a, b, x) {
    var f = (1 - Math.cos(x * Math.PI)) / 2;
    return a * (1 - f) + b * f;
  }

  interpolate_noise(x) {
    var xi = Math.floor(x);
    return this.linear_interpolate(
      this.smooth_noise(xi),
      this.smooth_noise(xi + 1),
      x - xi
    );
  }

  interpolate_noise_2d(x, y) {
    var xi = Math.floor(x);
    var yi = Math.floor(y);
    var a = this.linear_interpolate(
      this.smooth_noise_2d(xi, yi),
      this.smooth_noise_2d(xi + 1, yi),
      x - xi
    );
    var b = this.linear_interpolate(
      this.smooth_noise_2d(xi, yi + 1),
      this.smooth_noise_2d(xi + 1, yi + 1),
      x - xi
    );
    return this.linear_interpolate(a, b, y - yi);
  }

  perlin_noise(x) {
    var total = 0;
    for (var i = 0; i < this.octaves; i++) {
      var frequency = Math.pow(2, i);
      var amplitude = Math.pow(this.persistence, i);
      total += this.interpolate_noise(x * frequency) * amplitude;
    }
    return total;
  }

  perlin_noise_2d(x, y) {
    var total = 0;
    for (var i = 0; i < this.octaves; i++) {
      var frequency = Math.pow(2, i);
      var amplitude = Math.pow(this.persistence, i);
      total +=
        this.interpolate_noise_2d(x * frequency, y + frequency) * amplitude;
    }
    return total;
  }
}
