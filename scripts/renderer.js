import * as CG from './transforms.js';
import { Matrix } from "./matrix.js";


class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;

        let hCenter = this.canvas.width / 2;
        let vCenter = this.canvas.height / 2; 

        this.models = {
            slide0: [
                {
                    vertices: [
                        CG.Vector3(130, 110, 1),
                        CG.Vector3(128.5, 117.7, 1),
                        CG.Vector3(124.1, 124.1, 1),
                        CG.Vector3(117.7, 128.5, 1),
                        CG.Vector3(110, 130, 1),
                        CG.Vector3(102.3, 128.5, 1),
                        CG.Vector3(95.9, 124.1, 1),
                        CG.Vector3(91.5, 117.7, 1),
                        CG.Vector3(90, 110, 1),
                        CG.Vector3(91.5, 102.3, 1),
                        CG.Vector3(95.9, 95.9, 1),
                        CG.Vector3(102.3, 91.5, 1),
                        CG.Vector3(110, 90, 1),
                        CG.Vector3(117.7, 91.5, 1),
                        CG.Vector3(124.1, 95.9, 1),
                        CG.Vector3(128.5, 102.3, 1)
                    ],
                    transform: null
                }
            ],
            
            slide1: [
                // Triangle
                {
                    vertices: [
                        CG.Vector3(0, -80, 1),
                        CG.Vector3(69, 40, 1),
                        CG.Vector3(-69, 40, 1)
                    ],
                    center: [hCenter, vCenter],
                    rev_per_sec: -1,
                    transform: new Matrix(3,3),
                    color: [0, 128, 128, 255]
                },
                // Square
                {
                    vertices: [
                        CG.Vector3(-60, -60, 1),
                        CG.Vector3(60, -60, 1),
                        CG.Vector3(60, 60, 1),
                        CG.Vector3(-60, 60, 1)
                    ],
                    center: [hCenter * 0.25, vCenter],
                    rev_per_sec: 0.25,
                    transform: new Matrix(3,3),
                    color: [230, 150, 30, 255]
                },
                // Hexagon
                {
                    vertices: [ CG.Vector3(0, -80, 1),
                                CG.Vector3(69, -40, 1),
                                CG.Vector3(69, 40, 1),
                                CG.Vector3(0, 80, 1),
                                CG.Vector3(-69, 40, 1),
                                CG.Vector3(-69, -40, 1)
                    ],
                    center: [hCenter * 1.75, vCenter],
                    rev_per_sec: 1.75,
                    transform: new Matrix(3,3),
                    color: [100, 70, 180, 255]
                }
            ],
            slide2: [],
            slide3: []
        };
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
        let t = time / 1000.0;              // Time since start
        let dt = delta_time / 1000.0;       // Time since last frame

        // Slide 0: Bouncing ball
        if (this.slide_idx == 0) { // translation 

            let current_tx = this.models.slide0.transform[0][2]; // current t_x value
            //let current_tx = this.models.slide0.transform.values[0][2];
            let v_x = this.models.slide0.velocity.x; // current v_x value
            let t_x = current_tx + v_x * delta_time; // calculate new position: p = p + velocity*delta(t)

            let current_ty = this.models.slide0.transform[1][2]; // current t_y value
            // let current_ty = this.models.slide0.transform.values[1][2];
            let v_y = this.models.slide0.velocity.y; // current v_y value
            let t_y = current_ty + v_y * delta_time; // calculate new position: p = p + velocity*delta(t)

            // update transformation matrix 
            this.models.slide0.transform = CG.mat3x3Translate(this.models.slide0.transform, t_x, t_y);
        }

        // Slide 1: Rotating polygons
        for(let m of this.models.slide1) {
            let angle = 2 * Math.PI * m.rev_per_sec * t;
            let mt = new Matrix(3, 3);
            CG.mat3x3Translate(mt, m.center[0], m.center[1]);
            let mr = new Matrix(3, 3);
            CG.mat3x3Rotate(mr, angle); 
            m.transform = Matrix.multiply([mt, mr]);
        }
        // Slide 2: Grow & Shrink

        // Slide 3: Fun

    }
    
    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        let teal = [0, 128, 128, 255];
        // make translation matrix a Matrix object (for multiplication)
        let translation_matrix = new Matrix(3,3); 
        translation_matrix.values = this.models.slide0.transform; 
        
        // make array of matrices that will be drawn 
        let tempCircle = []; // tempCircle is empty array
        for (let i = 0; i < 16; i++) { // for each point in the circle
            // new point is the translaiton matrix * old point 
            // push new point (as a Matrix object) to tempCircle
            tempCircle.push(Matrix.multiply([translation_matrix, this.models.slide0.vertices[i]])); 
        }

        // round all values in matrices 
        for (let i = 0; i < 16; i++) { // values at each point
            let unrounded_values = tempCircle[i].values; // store values in an array
            let rounded_x = Math.trunc(unrounded_values[0]); // round x
            let rounded_y = Math.trunc(unrounded_values[1]); // round y
            let rounded_vector = CG.Vector3(rounded_x, rounded_y, 1); // create a new vector with rounded values
            tempCircle[i] = rounded_vector; // replace old vector with rounded one
        }

        //console.log(tempCircle);

        this.drawConvexPolygon(tempCircle, teal); // draw polygon

        if (this.models.slide0.transform[0][2] > 670) {// hits right edge
            this.models.slide0.velocity.x = -30;
        }
        if (this.models.slide0.transform[0][2] < 30) {// hits left edge
            this.models.slide0.velocity.x = 100;
        }
        if (this.models.slide0.transform[1][2] > 570) {// hits top edge
            this.models.slide0.velocity.y = -150;
        }
        if (this.models.slide0.transform[0][2] > 670) {// hits bottom edge
            this.models.slide0.velocity.y = 50;
        }
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction
        
        for (let i = 0; i < this.models.slide1.length; i++){        // Passes through each polygon one by one.
            let model = this.models.slide1[i];
            let ver = [];                                           // Holds polygon's vertices after being moved into place.
            for (let j = 0; j < model.vertices.length; j++){        // Processes each polygon's vertex, where they are translated and rotated,
                ver.push(model.transform.mult(model.vertices[j]));  // then multiplied by the matrix by the vertex to get the 'at this moment'
            }                                                       // vertex's position.
            this.drawConvexPolygon(ver, model.color);
        }
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions
        
    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        
        
    }
    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };
