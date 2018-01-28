/* point_drag_controls.js
** Tom Gracey August 2017
**
** Controls for translating or rotating individual 
** objects about specific points under three.js
**
** Version 0.2 
** December 2017
**
** (c) Virtual Blue LTD. 2017
** Released under the MIT license
*/


//https://virtual.blue/point-drag-controls/
//https://virtual.blue/point-drag-controls/#what-is-point-drag-controls


THREE.PointDragControls = function(){
                                             
    this.globals = {                                    // globals - i.e. scoped across whole of PointDragControls
                                                        // They *can* be accessed externally via THREE.PointDragControls.globals
                                                        // - but normally this should not be necessary. Use
                                                        // an accessor function instead - e.g. .toggle_mode()

        raycaster:              new THREE.Raycaster(),

        pointer:                new THREE.Vector2(),    // either the mouse position or the touch location  
                     
        rev_intercept_from:     99999999,               // horrible! *'far' of infinity means nothing while this 
                                                        // number exists* because it effectively defines the far 
                                                        // position beyond which the controls will stop working.
                                                        // See where this variable is used in calculation for more info
                                                        // TODO: find a better way of doing this

        pointer: {                            
            current:            undefined,              // where the pointer is now
            last:               undefined,              // where it was before
            orig:               undefined               // where it was when the object was clicked
        },

        intersect: {                                    // world coord points where the mouse click intercepts
            forward:            undefined,              // (forward) the front of the object 
            reverse:            undefined,              // (reverse) the back of the object
            offset:             undefined               // vector from the origin of the object to the intercept point
        },

        active_axes: {
            r:                  undefined,              // rotation axis label (world coords) x, y or z
            t:                  undefined,              // translation axis (world coords) x, y or z
        },
        
        origin_touch_id:        undefined,              // for remembering the id of the touch event occurring 
                                                        // on the object to be rotated (in the 2 touch event
                                                        // situation, which is basically confined to z rotations
                                                        // on touch devices)
    
        init_dt:                { x: 0, y: 0 },         // for remembering total mouse movement before we decide
                                                        // which is the active axis

        dt:                     { x: 0, y: 0 },         // size of mouse (or finger) movement during current cycle
                                            
        mode:                   undefined,              // modes are 'rotate' or 'translate'. Initial mode is 
                                                        // defined in defaults
        
        click_timer:            undefined,              // for detecting double-click or double-tap
        
        double_click_timeout:   500,                    // max time diff between clicks (taps) to qualify as a 
                                                        // double click (in ms)
                                                        
        object_id_index:        []                      // track object ids for fast lookups
    };
    
    
    var g = this.globals;
       
    function set_mode(new_mode){
        if (new_mode == 'rotate' || new_mode == 'translate'){
            g.mode = new_mode;
        } else {
            throw "Invalid mode: "+new_mode+" not recognised";
        }
    };
    
    function toggle_mode(){
        if (g.mode == 'translate'){ 
            g.mode = 'rotate'; 
        } else if (g.mode == 'rotate') {
            g.mode = 'translate';
        } else {
            throw "invalid mode: "+g.mode+" not recognised";
        }
    };
    
    function include(objects){
            for (var i = 0; i <= objects.length - 1; i++){
                
                var already_included = false;
                for (var j = 0; j<= g.object_id_index.length - 1; j++){
                    if ( objects[i].uuid == object_id_index[j] ){
                        already_included= true;
                        break;
                    }
                    if (! already_included ){
                        p.objects.push( objects[i] );
                        g.object_id_index.push( objects[i].uuid );
                    }
                }
            }
        }
        
    function exclude(objects){
        for ( var i = 0; i <= objects.length - 1; i++ ){
            for( var j = 0; j<= g.object_index.length; j++){
                if ( g.object_id_index[j] == objects[i].uuid ){
                    p.objects.splice(j,1);
                    g.object_id_index.splice(j,1);
                }
            }
        }
    }

        
    this.init = function(scene,camera,renderer,options){
        
        var defaults = {
    
            objects:            scene.children,     // array of objects to apply controls to
            
            turning_circle:     90,                 // controls mouse rotation sensitivity during object rotation. 
                                                    // Number of pixels to move the mouse through for a full rotation
                                                    // default = 1 pixel per 4 degrees
                                                
            near:               g.raycaster.near,   // nearest point to apply controls to
            
            far:                g.raycaster.far,    // furthest point to apply controls to
            
            snap_distance:      4,                  // only has effect when pointer axes are locked
                                                    // this is the minimum cumulative difference between screen x and y 
                                                    // values (in pixels) before the active axis is chosen
                                                    
            z_shift_distance:   10,                 // controls the sensitivity by which objects move towards/away from
                                                    // the camera when performing translations parallel to the camera
                                                    // normal vector. Bigger = less sensitive
                                                    
            z_control_axis:     'y',
                                                    
            mode_auto:          true,               // true = toggle mode by double-clicking (double-tapping) on empty
                                                    // canvas area. false = don't auto change mode at all. Let the app
                                                    // handle all mode changes via .toggle_mode() and set_mode(). Note
                                                    // .toggle_mode() and .set_mode() still work if mode_auto = true
                                                    
            init_mode:          'rotate',           // the mode to initialise with
            
            lock_translation_axes:  false,          // if true, decide which pointer axis (ie x or y) is preferred early
                                                    // in the pointer movement, then lock object translation to this axis
        
            lock_rotation_axes:     true,           // same as lock_translation_axis but for rotation. This is locked by
                                                    // default under the assumption that  rotations are less intuitive 
                                                    // than translations
                                                    
            auto_render:            false           // render whenever an object is transformed. False indicates this
                                                    // controller will not do any rendering (implies app is using an 
                                                    // animate() function)

        };
        
        var p = options || {};
        for( var key in defaults ){
            if (typeof p[key] == 'undefined' ){ p[key] = defaults[key]; }
        }
        g.raycaster.near = p.near;
        g.raycaster.far = p.far;
        g.mode = p.init_mode;
        
        for( var i=0; i<=p.objects.length-1; i++){
            g.object_id_index.push( p.objects.uuid );
        }


        function set_raycast_intercept(event_v){
            
            g.raycaster.setFromCamera(event_v, camera);
            
            var intersects = g.raycaster.intersectObjects(p.objects);
            
            if ( intersects.length > 0 ){
                g.intersect.forward = intersects[0];
                var posn = new THREE.Vector3().setFromMatrixPosition( g.intersect.forward.object.matrixWorld );
                g.intersect.offset = g.intersect.forward.point.clone().sub( posn );
                var rev = {
                    origin: g.raycaster.ray.origin.clone().addScaledVector(g.raycaster.ray.direction,g.rev_intercept_from),
                    direction: g.raycaster.ray.direction.clone().multiplyScalar(-1)
                };
                
                g.raycaster.set(rev.origin,rev.direction);
                rev.intersects = g.raycaster.intersectObjects(p.objects);
                g.intersect.reverse = rev.intersects[rev.intersects.length - 1];
                return true;
            }
            return false;
        }
        
    
        
        function double_click_toggle_mode(){
            if (g.click_timer == null) {
                g.click_timer = setTimeout(function () {
                    g.click_timer = null;
                }, g.double_click_timeout);
            } else {
                clearTimeout(g.click_timer);
                g.click_timer = null;
                toggle_mode();
            }
        }
                
        renderer.domElement.addEventListener('mousedown', function(e) {
            e.preventDefault();

            g.pointer.current = {x:e.clientX,y:e.clientY };
            g.pointer.last = { x: e.clientX, y: e.clientY };
            g.pointer.orig = { x: e.clientX, y: e.clientY };
            
            var button = detect_mouse_button(e);
            if ( typeof button != 'undefined' ){
                var object_clicked = set_raycast_intercept( get_pointer_v(g.pointer.current),camera);
                if ( object_clicked ){
                    if( button == 'right'){
                        g.active_axes = {
                            r: 'z',
                            t: 'z'
                        };
                    } else if (! axes_locked() ){
                        g.active_axes = {
                            r: 'xy',
                            t: 'xy'
                        };
                    }
                } else if (p.mode_auto){
                    double_click_toggle_mode();
                }
            }
        });



        renderer.domElement.addEventListener('touchstart', function(e){
            e.preventDefault();

            g.pointer.current = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
            g.pointer.last = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};           
            g.pointer.orig = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
            
            var object_clicked = set_raycast_intercept( get_pointer_v( g.pointer.current ),camera);
            if (object_clicked){
                g.origin_touch_id = e.changedTouches[0].identifier;
                g.pointer.last = g.pointer.orig;

                if (e.touches.length == 2){
                    g.active_axes = {
                        r: 'z',
                        t: 'z',
                    };
                } else if (! axes_locked() ){
                    g.active_axes = {
                        r: 'xy',
                        t: 'xy'
                    };
                }
                        
            } else if (p.mode_auto) {
                double_click_toggle_mode();
            }
        });
        


        renderer.domElement.addEventListener('touchmove', function(e){
                       
            if ( typeof g.intersect.forward != 'undefined' && typeof g.pointer.last != 'undefined'){
                var ct = e.changedTouches;
                var touch_num = 0;
                if (e.touches.length == 2){
                    touch_num = undefined;
                    if (ct.length == 1 && ct[0].identifier == g.origin_touch_id){ touch_num = 0; }
                    if (ct.length == 2 && ct[1].identifier == g.origin_touch_id){ touch_num = 1; }
                }
                
                if ( typeof touch_num != 'undefined' ){        
                    g.pointer.current={ 
                        x:    e.changedTouches[touch_num].clientX,                    
                        y:    e.changedTouches[touch_num].clientY
                    };

                    g.dt = {
                        x: g.pointer.current.x-g.pointer.last.x,
                        y: g.pointer.current.y-g.pointer.last.y
                    };
                    if (e.touches.length == 1 && axes_locked() ){
                        check_active_axes();
                    }
                    if ( typeof g.active_axes.r != 'undefined' ){
                        transform_object(g.pointer.current);
                    }
                    g.pointer.last = g.pointer.current;
                }
            }     
        });

        
        renderer.domElement.addEventListener('mousemove',function(e){

            if ( typeof g.intersect.forward != 'undefined'){
                g.pointer.current = {x:e.clientX,y:e.clientY};
                g.dt = {
                    x: g.pointer.current.x-g.pointer.last.x,
                    y: g.pointer.current.y-g.pointer.last.y
                };
                if( axes_locked() ){ check_active_axes(); }        
                if( typeof g.active_axes.r != 'undefined' ){
                    transform_object(g.pointer.current);
                }
                g.pointer.last = g.pointer.current;
            }
        });       


        function check_active_axes(offset){
                       
            if ( typeof g.active_axes.r == 'undefined' ){
            
                g.init_dt.x += Math.abs(g.dt.x);
                g.init_dt.y += Math.abs(g.dt.y);

                if ( g.init_dt.x - g.init_dt.y > p.snap_distance ){
                    g.active_axes = { 
                        t: 'x', 
                        r: 'y'
                    };
                }
                else if (g.init_dt.y - g.init_dt.x > p.snap_distance ){
                    g.active_axes = { 
                        t: 'y', 
                        r: 'x'
                    };
                }
            }

        }


        function transform_object(){

            if ( g.mode == 'translate' ){

                translate_object();

            } else if ( g.mode == 'rotate' ){

                rotate_object();

            } else {

                throw "invalid mode: "+g.mode+" not recognised";

            }         

            if (p.auto_render == true){
                renderer.render( scene, camera );
            }

        }



        function get_camera_correction(){
        
            var camera_correction = {
                pos: camera.matrixWorld.clone().setPosition( new THREE.Vector3(0,0,0) )
            }
            camera_correction.neg = new THREE.Matrix4().getInverse( camera_correction.pos.clone() );
            return camera_correction;
        }
        

        function rotate_object(){

            var transform = get_rotation_transform();
            var trans_correction = {
                neg:    trans_matrix( transform.origin.clone().multiplyScalar(-1) ),
                pos:    trans_matrix( transform.origin )
            };

            var camera_correction = get_camera_correction();
            
            var old_matrix = g.intersect.forward.object.matrixWorld.clone();
            
            var prep_matrix = 
                trans_correction.pos.clone()            
                .multiply(camera_correction.pos)
                .multiply(transform.matrix)
                .multiply(camera_correction.neg)
                .multiply(trans_correction.neg)
                .multiply(old_matrix);

            g.intersect.forward.object.matrixAutoUpdate = false;
            g.intersect.forward.object.matrix.copy( prep_matrix );

        }

        function translate_object(){
    
            var transform_matrix = get_translation_transform();
            var camera_correction = get_camera_correction();        
            var old_matrix = g.intersect.forward.object.matrixWorld.clone();
            var prep_matrix = 
                camera_correction.pos.clone()
                .multiply(transform_matrix)
                .multiply(camera_correction.neg)
                .multiply(old_matrix);

            g.intersect.forward.object.matrixAutoUpdate = false;
            g.intersect.forward.object.matrix.copy( prep_matrix );

        }
        

        function get_translation_transform(){

            var h = renderer.domElement.clientHeight / 2;
            var w = renderer.domElement.clientWidth / 2;

            var translation_origin = new THREE.Vector3(
                g.intersect.forward.point.x,
                g.intersect.forward.point.y,
                g.intersect.forward.point.z
            );

            var origin_rel = get_rel_coords( translation_origin );

            var orig_dt = {
                x: g.pointer.current.x-g.pointer.orig.x,
                y: g.pointer.current.y-g.pointer.orig.y
            };


            var last_posn = new THREE.Vector3().getPositionFromMatrix( g.intersect.forward.object.matrixWorld );
            var last_rel = get_rel_coords( last_posn.add( g.intersect.offset ) );

            var trans = new THREE.Vector3();
            if ( g.active_axes.t.match(/x/) ){ trans.setX( get_translation_distance(origin_rel.z,h,orig_dt.x) + last_rel.x - origin_rel.x ) }
            if ( g.active_axes.t.match(/y/) ){ trans.setY( - get_translation_distance(origin_rel.z,h,orig_dt.y) - last_rel.y + origin_rel.y ) }
            if ( g.active_axes.t.match(/z/) ){ trans.setZ( g.dt[p.z_control_axis] / p.z_shift_distance ) }


            var trans_matrix = new THREE.Matrix4().makeTranslation(trans.x,trans.y,trans.z);

            return trans_matrix;

        }
        
        
        function get_rel_coords(point){

            var point_v = point.clone().sub(camera.position.clone());
            var up4 = new THREE.Vector4(camera.up.x,camera.up.y,camera.up.z,0).applyMatrix4(camera.matrixWorld);
            
            var up = new THREE.Vector3(up4.x,up4.y,up4.z);

            var cam_horiz_v = up.clone().cross( camera.getWorldDirection() );
            var rel = {
                x: point_v.dot(cam_horiz_v),
                y: point_v.dot(up),
                z: point_v.dot( camera.getWorldDirection() )
            };
    
            return rel;

        }            
        

        function get_rotation_transform(){
           var rotation_origin = new THREE.Vector3(
                ( g.intersect.forward.point.x + g.intersect.reverse.point.x ) / 2,
                ( g.intersect.forward.point.y + g.intersect.reverse.point.y ) / 2,
                ( g.intersect.forward.point.z + g.intersect.reverse.point.z ) / 2
            );

            var rel = get_rel_coords( rotation_origin );
            
            var theta = {
                x: g.dt.y/ p.turning_circle,
                y: g.dt.x/ p.turning_circle,
                z: g.dt[p.z_control_axis]/ p.turning_circle
            };
            
            var rot_set = {
                x: new THREE.Matrix4().makeRotationX(theta.x),
                y: new THREE.Matrix4().makeRotationY(theta.y),
                z: new THREE.Matrix4().makeRotationZ(theta.z)
            };
            
            var screen_rel = {
                x : Math.atan( rel.y / rel.z ),
                y : Math.asin( rel.x / Math.sqrt( Math.pow(rel.x,2) + Math.pow(rel.y,2) + Math.pow(rel.z,2)  )),
                z : 0
            };
        
            var rel_r = {
                x: { 
                    pos: new THREE.Matrix4().makeRotationX( screen_rel.x ),
                    neg: new THREE.Matrix4().makeRotationX( - screen_rel.x ),
                },
                y:  {
                    pos: new THREE.Matrix4().makeRotationY( screen_rel.y ),
                    neg: new THREE.Matrix4().makeRotationY( - screen_rel.y ),
                }
            }
                
            
            var rot = new THREE.Matrix4();
            
            if (g.active_axes.r.match(/x/)){ rot.multiply( rot_set.x ); }
            if (g.active_axes.r.match(/y/)){ rot.multiply( rot_set.y ); }
            if (g.active_axes.r.match(/z/)){ rot.multiply( rot_set.z ); }

            return {
                matrix: rel_r.y.pos.clone()
                    .multiply(rel_r.x.pos)
                    .multiply(rot)
                    .multiply(rel_r.x.neg)
                    .multiply(rel_r.y.neg),
                origin: rotation_origin
            };
        }
        
        renderer.domElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });        
        renderer.domElement.addEventListener('mouseup', function(e) {
            clear_active_axes();
            return false;
        });
        renderer.domElement.addEventListener('mouseout', function(e) {
            clear_active_axes();
            return false;
        });
        renderer.domElement.addEventListener('touchend', function(e) {
            clear_active_axes();
            return false;
        });
        renderer.domElement.addEventListener('touchleave', function(e) {
            clear_active_axes();
            return false;
        });
        renderer.domElement.addEventListener('touchcancel', function(e) {
            clear_active_axes();
            return false;
        });

        function clear_active_axes(){
            g.intersect.forward = undefined;
            g.intersect.reverse = undefined;
            g.active_axes = {
                r: undefined,
                d: undefined,
                t: undefined
            };
            g.pointer.last = undefined;
            g.init_dt = { x: 0, y: 0 };
        }

        function trans_matrix(v){
            
            return new THREE.Matrix4().makeTranslation(v.x,v.y,v.z);

        }
        
        function detect_mouse_button(e){
            
            var b = ['left','right'];
            
            var result;
            
            for( var i = 0; i <= b.length - 1; i++){            
                if ("buttons" in e && e.buttons == i + 1) {
                    result = b[i];
                    break;
                }
                var button = e.which || e.button;
                if (button == i + 1){
                    result = b[i];
                    break;
                }
            }
            
            return result;
        }
        
        function axes_locked(){
            var locked = false;
            if ( 
                g.mode == 'translate' && p.lock_translation_axes == true ||
                g.mode == 'rotate' && p.lock_rotation_axes == true
            ){
                locked = true;
            }
            return locked;
        }
                
        
        function get_pointer_v(loc){
            
            var rect = renderer.domElement.getBoundingClientRect();
            return new THREE.Vector2(
                ( ( loc.x - rect.left ) / renderer.domElement.clientWidth ) * 2 - 1,
                - ( ( loc.y - rect.top ) / renderer.domElement.clientHeight ) * 2 + 1
            );
            
        }

        function get_translation_distance(Z,h,dx){
            var DX =  dx * Z * Math.tan(camera.fov * Math.PI / 360) / h;
            return DX;
        }

    };
    
    this.include = include;
    this.exclude = exclude;
    this.toggle_mode = toggle_mode;
    this.set_mode = set_mode;
    this.mode = g.mode;
    
}