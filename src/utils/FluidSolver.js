export class FluidSolver {
    constructor(size) {
        this.size = size;
        this.dt = 0.1;
        this.diffusion = 0.0001;
        this.viscosity = 0.0001;

        this.px = new Float32Array((size + 2) * (size + 2));
        this.py = new Float32Array((size + 2) * (size + 2));
        this.px0 = new Float32Array((size + 2) * (size + 2));
        this.py0 = new Float32Array((size + 2) * (size + 2));
        this.density = new Float32Array((size + 2) * (size + 2));
        this.density0 = new Float32Array((size + 2) * (size + 2));
    }

    addDensity(x, y, amount) {
        const i = Math.floor(x * this.size) + 1;
        const j = Math.floor(y * this.size) + 1;
        if (i < 1 || i > this.size || j < 1 || j > this.size) return;
        this.density[i + j * (this.size + 2)] += amount;
    }

    addVelocity(x, y, amountX, amountY) {
        const i = Math.floor(x * this.size) + 1;
        const j = Math.floor(y * this.size) + 1;
        if (i < 1 || i > this.size || j < 1 || j > this.size) return;
        const idx = i + j * (this.size + 2);
        this.px[idx] += amountX;
        this.py[idx] += amountY;
    }

    step() {
        this.velStep(this.px, this.py, this.px0, this.py0);
        this.densStep(this.density, this.density0, this.px, this.py);
    }

    getDensity(x, y) {
        const i = Math.floor(x * this.size) + 1;
        const j = Math.floor(y * this.size) + 1;
        if (i < 1 || i > this.size || j < 1 || j > this.size) return 0;
        return this.density[i + j * (this.size + 2)];
    }

    // --- Private Math Helpers ---

    setBnd(b, x) {
        const n = this.size;
        const s = n + 2;
        // Periodic boundary conditions (wrapping)
        for (let i = 1; i <= n; i++) {
            x[0 + s * i] = x[n + s * i];
            x[n + 1 + s * i] = x[1 + s * i];
            x[i + s * 0] = x[i + s * n];
            x[i + s * (n + 1)] = x[i + s * 1];
        }
        x[0 + s * 0] = 0.5 * (x[1 + s * 0] + x[0 + s * 1]);
        x[0 + s * (n + 1)] = 0.5 * (x[1 + s * (n + 1)] + x[0 + s * n]);
        x[n + 1 + s * 0] = 0.5 * (x[n + s * 0] + x[n + 1 + s * 1]);
        x[n + 1 + s * (n + 1)] = 0.5 * (x[n + s * (n + 1)] + x[n + 1 + s * n]);
    }

    linSolve(b, x, x0, a, c) {
        const n = this.size;
        const s = n + 2;
        for (let k = 0; k < 20; k++) {
            for (let j = 1; j <= n; j++) {
                for (let i = 1; i <= n; i++) {
                    x[i + s * j] = (x0[i + s * j] + a * (x[i - 1 + s * j] + x[i + 1 + s * j] + x[i + s * (j - 1)] + x[i + s * (j + 1)])) / c;
                }
            }
            this.setBnd(b, x);
        }
    }

    diffuse(b, x, x0, diff) {
        const a = this.dt * diff * this.size * this.size;
        this.linSolve(b, x, x0, a, 1 + 4 * a);
    }

    advect(b, d, d0, u, v) {
        const n = this.size;
        const s = n + 2;
        const dt0 = this.dt * n;
        for (let j = 1; j <= n; j++) {
            for (let i = 1; i <= n; i++) {
                let x = i - dt0 * u[i + s * j];
                let y = j - dt0 * v[i + s * j];
                
                // Wrapping coordinates for borderless feel
                while (x < 0.5) x += n;
                while (x > n + 0.5) x -= n;
                while (y < 0.5) y += n;
                while (y > n + 0.5) y -= n;

                const i0 = Math.floor(x); const i1 = i0 + 1;
                const j0 = Math.floor(y); const j1 = j0 + 1;
                
                const s1 = x - i0; const s0 = 1 - s1;
                const t1 = y - j0; const t0 = 1 - t1;
                
                d[i + s * j] = s0 * (t0 * d0[i0 + s * j0] + t1 * d0[i0 + s * j1]) +
                              s1 * (t0 * d0[i1 + s * j0] + t1 * d0[i1 + s * j1]);
            }
        }
        this.setBnd(b, d);
    }

    project(u, v, p, div) {
        const n = this.size;
        for (let j = 1; j <= n; j++) {
            for (let i = 1; i <= n; i++) {
                div[i + (n + 2) * j] = -0.5 * (u[i + 1 + (n + 2) * j] - u[i - 1 + (n + 2) * j] + v[i + (n + 2) * (j + 1)] - v[i + (n + 2) * (j - 1)]) / n;
                p[i + (n + 2) * j] = 0;
            }
        }
        this.setBnd(0, div); this.setBnd(0, p);
        this.linSolve(0, p, div, 1, 4);
        for (let j = 1; j <= n; j++) {
            for (let i = 1; i <= n; i++) {
                u[i + (n + 2) * j] -= 0.5 * n * (p[i + 1 + (n + 2) * j] - p[i - 1 + (n + 2) * j]);
                v[i + (n + 2) * j] -= 0.5 * n * (p[i + (n + 2) * (j + 1)] - p[i + (n + 2) * (j - 1)]);
            }
        }
        this.setBnd(1, u); this.setBnd(2, v);
    }

    densStep(x, x0, u, v) {
        this.diffuse(0, x0, x, this.diffusion);
        this.advect(0, x, x0, u, v);
    }

    velStep(u, v, u0, v0) {
        this.diffuse(1, u0, u, this.viscosity);
        this.diffuse(2, v0, v, this.viscosity);
        this.project(u0, v0, u, v);
        this.advect(1, u, u0, u0, v0);
        this.advect(2, v, v0, u0, v0);
        this.project(u, v, u0, v0);
    }
}
