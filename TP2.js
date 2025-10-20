/**
*	[NOM] : Nguyen
*	[PRÉNOM] : Trung
*	[MATRICULE] : 20238006
*/

import * as THREE from 'three';

import Stats from './libs/stats.module.js';

import { ColladaLoader } from 'ColladaLoader';

import { OrbitControls } from 'OrbitControls'

//SPECIAL IMPORT
// THREEx.KeyboardState.js keep the current state of the keyboard.
// It is possible to query it at any time. No need of an event.
// This is particularly convenient in loop driven case, like in
// 3D demos or games.
//
// # Usage
//
// **Step 1**: Create the object
//
// ```var keyboard	= new THREEx.KeyboardState();```
//
// **Step 2**: Query the keyboard state
//
// This will return true if shift and A are pressed, false otherwise
//
// ```keyboard.pressed("shift+A")```
//
// **Step 3**: Stop listening to the keyboard
//
// ```keyboard.destroy()```
//
// NOTE: this library may be nice as standaline. independant from three.js
// - rename it keyboardForGame
//
// # Code
//

/** @namespace */
var THREEx = THREEx || {};

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
 */
THREEx.KeyboardState = function (domElement) {
    this.domElement = domElement || document;
    // to store the current state
    this.keyCodes = {};
    this.modifiers = {};

    // create callback to bind/unbind keyboard events
    var _this = this;
    this._onKeyDown = function (event) {
        _this._onKeyChange(event)
    }
    this._onKeyUp = function (event) {
        _this._onKeyChange(event)
    }

    // bind keyEvents
    this.domElement.addEventListener("keydown", this._onKeyDown, false);
    this.domElement.addEventListener("keyup", this._onKeyUp, false);

    // create callback to bind/unbind window blur event
    this._onBlur = function () {
        for (var prop in _this.keyCodes)
            _this.keyCodes[prop] = false;
        for (var prop in _this.modifiers)
            _this.modifiers[prop] = false;
    }

    // bind window blur
    window.addEventListener("blur", this._onBlur, false);
}

/**
 * To stop listening of the keyboard events
 */
THREEx.KeyboardState.prototype.destroy = function () {
    // unbind keyEvents
    this.domElement.removeEventListener("keydown", this._onKeyDown, false);
    this.domElement.removeEventListener("keyup", this._onKeyUp, false);

    // unbind window blur event
    window.removeEventListener("blur", this._onBlur, false);
}

THREEx.KeyboardState.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'tab': 9,
    'escape': 27
};

/**
 * to process the keyboard dom event
 */
THREEx.KeyboardState.prototype._onKeyChange = function (event) {
    // log to debug
    //console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

    // update this.keyCodes
    var keyCode = event.keyCode
        var pressed = event.type === 'keydown' ? true : false
        this.keyCodes[keyCode] = pressed
        // update this.modifiers
        this.modifiers['shift'] = event.shiftKey
        this.modifiers['ctrl'] = event.ctrlKey
        this.modifiers['alt'] = event.altKey
        this.modifiers['meta'] = event.metaKey
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
 */
THREEx.KeyboardState.prototype.pressed = function (keyDesc) {
    var keys = keyDesc.split("+");
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
            var pressed = false
            if (THREEx.KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.modifiers[key];
            } else if (Object.keys(THREEx.KeyboardState.ALIAS).indexOf(key) != -1) {
                pressed = this.keyCodes[THREEx.KeyboardState.ALIAS[key]];
            } else {
                pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)]
            }
            if (!pressed)
                return false;
    };
    return true;
}

/**
 * return true if an event match a keyDesc
 * @param  {KeyboardEvent} event   keyboard event
 * @param  {String} keyDesc string description of the key
 * @return {Boolean}         true if the event match keyDesc, false otherwise
 */
THREEx.KeyboardState.prototype.eventMatches = function (event, keyDesc) {
    var aliases = THREEx.KeyboardState.ALIAS
        var aliasKeys = Object.keys(aliases)
        var keys = keyDesc.split("+")
        // log to debug
        // console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var pressed = false;
            if (key === 'shift') {
                pressed = (event.shiftKey ? true : false)
            } else if (key === 'ctrl') {
                pressed = (event.ctrlKey ? true : false)
            } else if (key === 'alt') {
                pressed = (event.altKey ? true : false)
            } else if (key === 'meta') {
                pressed = (event.metaKey ? true : false)
            } else if (aliasKeys.indexOf(key) !== -1) {
                pressed = (event.keyCode === aliases[key] ? true : false);
            } else if (event.keyCode === key.toUpperCase().charCodeAt(0)) {
                pressed = true;
            }
            if (!pressed)
                return false;
        }
        return true;
}

let container, stats, clock, controls;
let lights, camera, scene, renderer, human, humanGeometry, humanMaterial, humanMesh, robot;
let skinWeight, skinIndices, boneArray, realBones, boneDict, centerOfMass;


THREE.Object3D.prototype.setMatrix = function (m) {
    this.matrix=m;
    this.matrix.decompose(this.position, this.quaternion, this.scale);
};


class Robot {
    constructor(h) {
this.spineLength = 0.65305 ;
		this.chestLength =0.46487;
		this.neckLength = 0.24523
		this.headLength = 0.39284;

		this.armLength = 0.72111;
		this.forearmLength = 0.61242;
		this.legLength = 1.16245;
		this.shinLength = 1.03432;

		this.armLeftRotation = realBones[4].rotation;
		this.forearmLeftRotation = realBones[5].rotation;
		this.armRightRotation  = realBones[6].rotation;
		this.forearmRightRotation = realBones[7].rotation;

		this.legLeftRotation = realBones[8].rotation;
		this.shinLeftRotation = realBones[9].rotation;
		this.legRightRotation = realBones[10].rotation;
		this.shinRightRotation = realBones[11].rotation;

		this.spineTranslation = realBones[0].position;
		this.chestTranslation = realBones[1].position;
		this.neckTranslation = realBones[2].position;
		this.headTranslation = realBones[3].position;
		this.armLeftTranslation = realBones[4].position;
		this.forearmLeftTranslation =  realBones[5].position;
		this.armRightTranslation  = realBones[6].position;
		this.forearmRightTranslation = realBones[7].position;

		this.legLeftTranslation =  realBones[8].position;
		this.shinLeftTranslation =  realBones[9].position;
		this.legRightTranslation=  realBones[10].position;
		this.shinRightTranslation =  realBones[11].position;


        this.bodyWidth = 0.2;
        this.bodyDepth = 0.2;


        this.neckRadius = 0.1;

        this.headRadius = 0.32;


        this.legRadius = 0.10;
        this.thighRadius = 0.1;
        this.footDepth = 0.4;
        this.footWidth = 0.25;

        this.armRadius = 0.10;

        this.handRadius = 0.1;

        // Material
        this.material = new THREE.MeshNormalMaterial();
        this.human = h;
        // Initial pose
        this.initialize()
    }

    initialize() {
      // Spine geomerty
        var spineGeometry = new THREE.CylinderGeometry(0.5*this.bodyWidth / 2, this.bodyWidth / 2,this.spineLength, 64);
        if (!this.hasOwnProperty("spine"))
            this.spine = new THREE.Mesh(spineGeometry, this.material);

		var chestGeometry = new THREE.CylinderGeometry(0.5*this.bodyWidth / 2, this.bodyWidth / 2, this.chestLength, 64);
		 if (!this.hasOwnProperty("chest"))
            this.chest = new THREE.Mesh(chestGeometry, this.material);

        // Neck geomerty
        var neckGeometry = new THREE.CylinderGeometry(0.5*this.neckRadius, this.neckRadius, this.neckLength, 64);
        if (!this.hasOwnProperty("neck"))
            this.neck = new THREE.Mesh(neckGeometry, this.material);

        // Head geomerty
        var headGeometry = new THREE.SphereGeometry(this.headLength/2, 64, 3);
        if (!this.hasOwnProperty("head"))
            this.head = new THREE.Mesh(headGeometry, this.material);

        // Leg, shin, foot, arm, forearm, hand geomerty
        var legGeometry = new THREE.CylinderGeometry(0.5* this.legRadius, this.legRadius, this.legLength, 64);
        if (!this.hasOwnProperty("leg_L"))
            this.legLeft = new THREE.Mesh(legGeometry, this.material);
        if (!this.hasOwnProperty("leg_R"))
            this.legRight = new THREE.Mesh(legGeometry, this.material);


        var shinGeometry = new THREE.CylinderGeometry(0.5*this.thighRadius, this.thighRadius, this.shinLength, 64);
        if (!this.hasOwnProperty("shin_L"))
            this.shinLeft = new THREE.Mesh(shinGeometry, this.material);  
        if (!this.hasOwnProperty("shin_R"))
            this.shinRight = new THREE.Mesh(shinGeometry, this.material);

        
        var footGeometry = new THREE.BoxGeometry(this.footWidth, 0.17, 0.8*this.footDepth);
        if (!this.hasOwnProperty("foot_L"))
            this.footLeft = new THREE.Mesh(footGeometry, this.material);
        if (!this.hasOwnProperty("foot_R"))
            this.footRight = new THREE.Mesh(footGeometry, this.material);


        var armGeometry = new THREE.CylinderGeometry(0.5*this.armRadius, this.armRadius, this.armLength, 64);
        if (!this.hasOwnProperty("arm_L"))
            this.armLeft = new THREE.Mesh(armGeometry, this.material);    
        if (!this.hasOwnProperty("arm_R"))
            this.armRight = new THREE.Mesh(armGeometry, this.material);


        var forearmGeometry = new THREE.CylinderGeometry(0.5*this.armRadius, this.armRadius, this.forearmLength, 64);
        if (!this.hasOwnProperty("forearm_L"))
            this.forearmLeft = new THREE.Mesh(forearmGeometry, this.material);
        if (!this.hasOwnProperty("forearm_R"))
            this.forearmRight = new THREE.Mesh(forearmGeometry, this.material);


        var handGeometry = new THREE.SphereGeometry(this.handRadius, 64, 3);
        if (!this.hasOwnProperty("hand_L"))
            this.handLeft = new THREE.Mesh(handGeometry, this.material);
        if (!this.hasOwnProperty("hand_R"))
            this.handRight = new THREE.Mesh(handGeometry, this.material);


        // Spine matrix
        this.spineMatrix = new THREE.Matrix4().set(

                1, 0, 0, 0,
                0, 1, 0, this.spineTranslation.y+this.spineLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
		this.chestMatrix = new THREE.Matrix4().set(

                1, 0, 0, 0,
                0, 1, 0, this.chestTranslation.y-this.spineLength/2+this.chestLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
		var chestMatrix =  matMul(this.spineMatrix, this.chestMatrix);


        // Neck matrix
        this.neckMatrix = new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 1, 0, this.neckTranslation.y-this.chestLength/2+this.neckLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
        var neckMatrix = matMul(chestMatrix, this.neckMatrix);


        // Head matrix
        this.headMatrix = new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 1, 0, this.headTranslation.y-this.neckLength/2+this.headLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
        var headMatrix = matMul(neckMatrix, this.headMatrix);

        // Left Arm Matrix
        this.armLeftMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.armLeftTranslation.x,
            0, 1, 0, this.armLeftTranslation.y-this.chestLength/2, // augmente d'un demi chest
            0, 0, 1, this.armLeftTranslation.z,
            0, 0, 0, 1); 
        this.armLeftMatrix = matMul( this.armLeftMatrix, rotZ(this.armLeftRotation.z) );
        this.armLeftMatrix = matMul( this.armLeftMatrix, rotY(this.armLeftRotation.y) );
        this.armLeftMatrix = matMul( this.armLeftMatrix, rotX(this.armLeftRotation.x) );
        this.armLeftMatrix = matMul( this.armLeftMatrix, translation(0, this.armLength/2 , 0) );
        var armLeftMatrix = new THREE.Matrix4().multiplyMatrices(chestMatrix, this.armLeftMatrix);

        // Left Forearm Matrix 
        this.forearmLeftMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.forearmLeftTranslation.x,
            0, 1, 0, this.forearmLeftTranslation.y-this.armLength/2+this.forearmLength/2,
            0, 0, 1, this.forearmLeftTranslation.z,
            0, 0, 0, 1);
        this.forearmLeftMatrix = matMul( this.forearmLeftMatrix, translation(0,-this.forearmLength/2,0) );
        this.forearmLeftMatrix = matMul( this.forearmLeftMatrix, rotZ(this.forearmLeftRotation.z) );
        this.forearmLeftMatrix = matMul( this.forearmLeftMatrix, rotY(this.forearmLeftRotation.y) );
        this.forearmLeftMatrix = matMul( this.forearmLeftMatrix, rotX(this.forearmLeftRotation.x) );    
        this.forearmLeftMatrix = matMul( this.forearmLeftMatrix, translation(0, this.forearmLength/2,0) ); 
        var forearmLeftMatrix = new THREE.Matrix4().multiplyMatrices(armLeftMatrix, this.forearmLeftMatrix);

        // Left Hand Matrix
        this.handLeftMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.forearmLeftTranslation.x,
            0, 1, 0, this.forearmLength/2+this.handRadius,
            0, 0, 1, 0,
            0, 0, 0, 1);
        var handLeftMatrix = new THREE.Matrix4().multiplyMatrices(forearmLeftMatrix, this.handLeftMatrix);

        // Right Arm Matrix
        this.armRightMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.armRightTranslation.x,
            0, 1, 0, this.armRightTranslation.y-this.chestLength/2, 
            0, 0, 1, this.armRightTranslation.z,
            0, 0, 0, 1);
        this.armRightMatrix = matMul( this.armRightMatrix, rotZ(this.armRightRotation.z) );
        this.armRightMatrix = matMul( this.armRightMatrix, rotY(this.armRightRotation.y) );
        this.armRightMatrix = matMul( this.armRightMatrix, rotX(this.armRightRotation.x) );
        this.armRightMatrix = matMul( this.armRightMatrix, translation(0, this.armLength/2, 0) );
        var armRightMatrix = new THREE.Matrix4().multiplyMatrices(chestMatrix, this.armRightMatrix);

        // Right Forearm Matrix 
        this.forearmRightMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.forearmRightTranslation.x,
            0, 1, 0, this.forearmRightTranslation.y-this.armLength/2+this.forearmLength/2,
            0, 0, 1, this.forearmRightTranslation.z,
            0, 0, 0, 1);
        this.forearmRightMatrix = matMul( this.forearmRightMatrix, translation(0,-this.forearmLength/2,0) );
        this.forearmRightMatrix = matMul( this.forearmRightMatrix, rotZ(this.forearmRightRotation.z) );
        this.forearmRightMatrix = matMul( this.forearmRightMatrix, rotY(this.forearmRightRotation.y) );
        this.forearmRightMatrix = matMul( this.forearmRightMatrix, rotX(this.forearmRightRotation.x) );
        this.forearmRightMatrix = matMul( this.forearmRightMatrix, translation(0,this.forearmLength/2,0) );
        var forearmRightMatrix = new THREE.Matrix4().multiplyMatrices(armRightMatrix, this.forearmRightMatrix);

        // Right Hand Matrix
        this.handRightMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.forearmRightTranslation.x,
            0, 1, 0, this.forearmLength/2+this.handRadius,
            0, 0, 1, 0,
            0, 0, 0, 1);
        var handRightMatrix = new THREE.Matrix4().multiplyMatrices(forearmRightMatrix, this.handRightMatrix);

        //Left Leg Matrix
        this.legLeftMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.legLeftTranslation.x,
            0, 1, 0, this.legLeftTranslation.y-this.spineLength/2,
            0, 0, 1, this.legLeftTranslation.z,
            0, 0, 0, 1);
        this.legLeftMatrix=matMul(this.legLeftMatrix, rotX(this.legLeftRotation.x));
        this.legLeftMatrix=matMul(this.legLeftMatrix, rotY(this.legLeftRotation.y));
        this.legLeftMatrix=matMul(this.legLeftMatrix, rotZ(this.legLeftRotation.z));
        this.legLeftMatrix=matMul(this.legLeftMatrix, translation(0,this.legLength/2,0));
        var legLeftMatrix = new THREE.Matrix4().multiplyMatrices(this.spineMatrix, this.legLeftMatrix);

        // Left Shin Matrix
        this.shinLeftMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.shinLeftTranslation.x,
            0, 1, 0, this.shinLeftTranslation.y-this.legLength/2+this.shinLength/2,
            0, 0, 1, this.shinLeftTranslation.z,
            0, 0, 0, 1);
        this.shinLeftMatrix  = matMul( this.shinLeftMatrix, translation(0,-this.shinLength/2,0) );
        this.shinLeftMatrix = matMul( this.shinLeftMatrix, rotZ(this.shinLeftRotation.z) );
        this.shinLeftMatrix = matMul( this.shinLeftMatrix, rotY(this.shinLeftRotation.y) );
        this.shinLeftMatrix = matMul( this.shinLeftMatrix, rotX(this.shinLeftRotation.x) );
        this.shinLeftMatrix  = matMul( this.shinLeftMatrix, translation(0,this.shinLength/2,0) );
        var shinLeftMatrix = new THREE.Matrix4().multiplyMatrices(legLeftMatrix, this.shinLeftMatrix);
        
        // Left Foot Matrix
        this.footLeftMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.shinLeftTranslation.x,
            0, 1, 0, this.shinLength/2,
            0, 0, 1, this.footDepth/4,
            0, 0, 0, 1);
        var footLeftMatrix = new THREE.Matrix4().multiplyMatrices(shinLeftMatrix, this.footLeftMatrix);

        //Right Leg Matrix
        this.legRightMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.legRightTranslation.x,
            0, 1, 0, this.legRightTranslation.y-this.spineLength/2,
            0, 0, 1, this.legRightTranslation.z,
            0, 0, 0, 1);
        this.legRightMatrix=matMul(this.legRightMatrix, rotX(this.legRightRotation.x));
        this.legRightMatrix=matMul(this.legRightMatrix, rotY(this.legRightRotation.y));
        this.legRightMatrix=matMul(this.legRightMatrix, rotZ(this.legRightRotation.z));
        this.legRightMatrix=matMul(this.legRightMatrix, translation(0,this.legLength/2,0));
        var legRightMatrix = new THREE.Matrix4().multiplyMatrices(this.spineMatrix, this.legRightMatrix);
        
        // Right Shin Matrix
        this.shinRightMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.shinRightTranslation.x,
            0, 1, 0, this.shinRightTranslation.y-this.legLength/2+this.shinLength/2,
            0, 0, 1, this.shinRightTranslation.z,
            0, 0, 0, 1);
            this.shinRightMatrix  = matMul( this.shinRightMatrix, translation(0,-this.shinLength/2,0) );
            this.shinRightMatrix = matMul( this.shinRightMatrix, rotX(this.shinRightRotation.x) );     
            this.shinRightMatrix = matMul( this.shinRightMatrix, rotY(this.shinRightRotation.y) );
            this.shinRightMatrix = matMul( this.shinRightMatrix, rotZ(this.shinRightRotation.z) );
            this.shinRightMatrix  = matMul( this.shinRightMatrix, translation(0,this.shinLength/2,0) );
        var shinRightMatrix = new THREE.Matrix4().multiplyMatrices(legRightMatrix, this.shinRightMatrix);

        // Right Foot Matrix
        this.footRightMatrix = new THREE.Matrix4().set(
            1, 0, 0, this.shinRightTranslation.x,
            0, 1, 0, this.shinLength/2,
            0, 0, 1, this.footDepth/4,
            0, 0, 0, 1);
        var footRightMatrix = new THREE.Matrix4().multiplyMatrices(shinRightMatrix, this.footRightMatrix);

        // Apply transformation
        this.spine.setMatrix(this.spineMatrix);

        if (scene.getObjectById(this.spine.id) === undefined)
            scene.add(this.spine);

		this.chest.setMatrix(chestMatrix);

        if (scene.getObjectById(this.chest.id) === undefined)
            scene.add(this.chest);

        this.neck.setMatrix(neckMatrix);
        if (scene.getObjectById(this.neck.id) === undefined)
            scene.add(this.neck);

        this.head.setMatrix(headMatrix);
        if (scene.getObjectById(this.head.id) === undefined)
            scene.add(this.head);

        this.legLeft.setMatrix(legLeftMatrix);
        if (scene.getObjectById(this.legLeft.id) === undefined)
            scene.add(this.legLeft);

        this.legRight.setMatrix(legRightMatrix);
        if (scene.getObjectById(this.legRight.id) === undefined)
            scene.add(this.legRight);

        this.shinLeft.setMatrix(shinLeftMatrix);
        if (scene.getObjectById(this.shinLeft.id) === undefined)
            scene.add(this.shinLeft);

        this.shinRight.setMatrix(shinRightMatrix);
        if (scene.getObjectById(this.shinRight.id) === undefined)
            scene.add(this.shinRight);

        this.footLeft.setMatrix(footLeftMatrix);
        if (scene.getObjectById(this.footLeft.id) === undefined)
            scene.add(this.footLeft);

        this.footRight.setMatrix(footRightMatrix);
        if (scene.getObjectById(this.footRight.id) === undefined)
            scene.add(this.footRight);

        this.armLeft.setMatrix(armLeftMatrix);
        if (scene.getObjectById(this.armLeft.id) === undefined)
            scene.add(this.armLeft);

        this.armRight.setMatrix(armRightMatrix);
        if (scene.getObjectById(this.armRight.id) === undefined)
            scene.add(this.armRight);

        this.forearmLeft.setMatrix(forearmLeftMatrix);
        if (scene.getObjectById(this.forearmLeft.id) === undefined)
            scene.add(this.forearmLeft);

        this.forearmRight.setMatrix(forearmRightMatrix);
        if (scene.getObjectById(this.forearmRight.id) === undefined)
            scene.add(this.forearmRight);
        
        this.handLeft.setMatrix(handLeftMatrix);
        if (scene.getObjectById(this.handLeft.id) === undefined)
            scene.add(this.handLeft);

        this.handRight.setMatrix(handRightMatrix);
        if (scene.getObjectById(this.handRight.id) === undefined)
            scene.add(this.handRight);


    }
    hideRobot() {
        this.spine.visible = false;
        this.chest.visible = false;
        this.neck.visible = false;
        this.head.visible = false;
        this.legLeft.visible = false;
        this.legRight.visible = false;
        this.shinLeft.visible = false;
        this.shinRight.visible = false;
        this.footLeft.visible = false;
        this.footRight.visible = false;
        this.armLeft.visible = false;
        this.armRight.visible = false;
        this.forearmLeft.visible = false;
        this.forearmRight.visible = false;
        this.handLeft.visible = false;
        this.handRight.visible = false;
    }
    hideHuman() {
        this.human.visible = false;
    }

    showRobot() {
        this.spine.visible = true;
        this.chest.visible = true;
        this.neck.visible = true;
        this.head.visible = true;
        this.legLeft.visible = true;
        this.legRight.visible = true;
        this.shinLeft.visible = true;
        this.shinRight.visible = true;
        this.footLeft.visible = true;
        this.footRight.visible = true;
        this.armLeft.visible = true;
        this.armRight.visible = true;
        this.forearmLeft.visible = true;
        this.forearmRight.visible = true;
        this.handLeft.visible = true;
        this.handRight.visible = true;

    }
    showHuman() {
        this.human.visible = true;
    }

	pose1() {

        const spineMatrix = this.spineMatrix;
        const chestMatrix = matMul(spineMatrix, this.chestMatrix);
        const neckMatrix = matMul(chestMatrix, this.neckMatrix);
        const headMatrix = matMul(neckMatrix, this.headMatrix);

        // Right arm (raised)
        let armRightTransformation = this.armRightMatrix
        armRightTransformation = matMul(chestMatrix, armRightTransformation);

        let forearmRightTransformation = matMul(this.forearmRightMatrix,translation(0,-this.forearmLength/2,0));
        forearmRightTransformation = matMul(forearmRightTransformation, rotX(20));
        forearmRightTransformation = matMul(forearmRightTransformation,translation(0,this.forearmLength/2,0));
        forearmRightTransformation = matMul(armRightTransformation, forearmRightTransformation);

        let handRightTransformation = matMul(forearmRightTransformation, this.handRightMatrix);

        // Left arm (raised)
        let armLeftTransformation = this.armLeftMatrix
        armLeftTransformation = matMul(chestMatrix, armLeftTransformation);

        let forearmLeftTransformation = matMul(this.forearmLeftMatrix,translation(0,-this.forearmLength/2,0));
        forearmLeftTransformation = matMul(forearmLeftTransformation, rotX(20));
        forearmLeftTransformation = matMul(forearmLeftTransformation,translation(0,this.forearmLength/2,0));
        forearmLeftTransformation = matMul(armLeftTransformation, forearmLeftTransformation);

        let handLeftTransformation = matMul(forearmLeftTransformation, this.handLeftMatrix);

        // Left leg (curled back)
        let legLeftTransformation = matMul(this.legLeftMatrix,translation(0,-this.legLength/2,0));
        legLeftTransformation = matMul(legLeftTransformation, rotX(200));
        legLeftTransformation = matMul(legLeftTransformation, translation(0,this.legLength/2,0));
        legLeftTransformation = matMul(spineMatrix, legLeftTransformation);

        let shinLeftTransformation = matMul(this.shinLeftMatrix,translation(0,-this.shinLength/2,0));
        shinLeftTransformation = matMul(shinLeftTransformation, rotX(50));
        shinLeftTransformation = matMul(shinLeftTransformation, translation(0,this.shinLength/2,0));
        shinLeftTransformation = matMul(legLeftTransformation, shinLeftTransformation);


        let footLeftTransformation = matMul(shinLeftTransformation, this.footLeftMatrix);

        // Right leg (curled back)
        let legRightTransformation = matMul(this.legRightMatrix,translation(0,-this.legLength/2,0));
        legRightTransformation = matMul(legRightTransformation, rotX(200));
        legRightTransformation = matMul(legRightTransformation, translation(0,this.legLength/2,0));
        legRightTransformation = matMul(spineMatrix, legRightTransformation);

        let shinRightTransformation = matMul(this.shinRightMatrix,translation(0,-this.shinLength/2,0));
        shinRightTransformation = matMul(shinRightTransformation, rotX(50));
        shinRightTransformation = matMul(shinRightTransformation, translation(0,this.shinLength/2,0));
        shinRightTransformation = matMul(legRightTransformation, shinRightTransformation);


        let footRightTransformation = matMul(shinRightTransformation, this.footRightMatrix);

        
        this.spine.setMatrix(spineMatrix);
        this.chest.setMatrix(chestMatrix);
        this.neck.setMatrix(neckMatrix);
        this.head.setMatrix(headMatrix);

        this.armRight.setMatrix(armRightTransformation);
        this.forearmRight.setMatrix(forearmRightTransformation);
        this.handRight.setMatrix(handRightTransformation);

        this.armLeft.setMatrix(armLeftTransformation);
        this.forearmLeft.setMatrix(forearmLeftTransformation);
        this.handLeft.setMatrix(handLeftTransformation);

        this.legLeft.setMatrix(legLeftTransformation);
        this.shinLeft.setMatrix(shinLeftTransformation);
        this.footLeft.setMatrix(footLeftTransformation);

        this.legRight.setMatrix(legRightTransformation);
        this.shinRight.setMatrix(shinRightTransformation);
        this.footRight.setMatrix(footRightTransformation);

        boneDict["Spine"].setMatrix(matMul(matMul(this.spine.matrix, translation(0,-this.spineLength/2,0)), inverseOf(boneDict["Spine"].matrixWorld)));
        boneDict["Chest"].setMatrix(matMul(matMul(this.chest.matrix, translation(0,-this.chestLength/2,0)), inverseOf(boneDict["Chest"].matrixWorld))); 
        boneDict["Neck"].setMatrix(matMul(matMul(this.neck.matrix,translation(0, -this.neckLength/2,0)), inverseOf(boneDict["Neck"].matrixWorld))); 
        boneDict["Head"].setMatrix(matMul(matMul(this.head.matrix, translation(0,-this.headLength/2,0)), inverseOf(boneDict["Head"].matrixWorld))); 
        boneDict["Arm_R"].setMatrix(matMul(matMul(this.armRight.matrix, translation(0,-this.armLength/2,0)), inverseOf( boneDict["Arm_R"].matrixWorld))); 
        boneDict["Forearm_R"].setMatrix(matMul(matMul(this.forearmRight.matrix, translation(0,-this.forearmLength/2,0)), inverseOf( boneDict["Forearm_R"].matrixWorld))); 
        boneDict["Arm_L"].setMatrix(matMul(matMul(this.armLeft.matrix, translation(0,-this.armLength/2,0)), inverseOf( boneDict["Arm_L"].matrixWorld)));    
        boneDict["Forearm_L"].setMatrix(matMul(matMul(this.forearmLeft.matrix, translation(0,-this.forearmLength/2,0)), inverseOf( boneDict["Forearm_L"].matrixWorld))); 
        boneDict["Leg_R"].setMatrix(matMul(matMul(this.legRight.matrix, translation(0,-this.legLength/2,0)),inverseOf( boneDict["Leg_R"].matrixWorld ))); 
        boneDict["Shin_R"].setMatrix(matMul(matMul(this.shinRight.matrix, translation(0,-this.shinLength/2,0)),inverseOf( boneDict["Shin_R"].matrixWorld))); 
        boneDict["Leg_L"].setMatrix(matMul(matMul(this.legLeft.matrix, translation(0,-this.legLength/2,0)),inverseOf( boneDict["Leg_L"].matrixWorld)));
        boneDict["Shin_L"].setMatrix(matMul(matMul(this.shinLeft.matrix, translation(0,-this.shinLength/2,0)), inverseOf(boneDict["Shin_L"].matrixWorld))); // Update bone dict for skinning

        buildShaderBoneMatrix();
    }

	pose2(){
		// TODO DEFINIR LA DEUXIEME POSE ICI

        // Spine, chest, neck, head
        let spineTransformation = matMul(translation(0,-(this.legLength/2+this.shinLength/2),0), this.spineMatrix);
        let chestTransformation = matMul(spineTransformation, this.chestMatrix);
        let neckTransformation = matMul(chestTransformation, this.neckMatrix);
        let headTransformation = matMul(neckTransformation, this.headMatrix);

        // Right arm (bent down)
        let armRightTransformation = matMul(this.armRightMatrix,translation(0,-this.armLength/2,0));
        armRightTransformation = matMul(armRightTransformation, rotZ(70));
        armRightTransformation = matMul(armRightTransformation, translation(0,this.armLength/2,0));
        armRightTransformation = matMul(chestTransformation, armRightTransformation);

        let forearmRightTransformation = matMul(this.forearmRightMatrix,translation(0,-this.forearmLength/2,0));
        forearmRightTransformation = matMul(forearmRightTransformation, rotX(20));
        forearmRightTransformation = matMul(forearmRightTransformation,translation(0,this.forearmLength/2,0));
        forearmRightTransformation = matMul(armRightTransformation, forearmRightTransformation);

        let handRightTransformation = matMul(forearmRightTransformation, this.handRightMatrix);

        // Left arm (bent down)
        let armLeftTransformation = matMul(this.armLeftMatrix,translation(0,-this.armLength/2,0));
        armLeftTransformation = matMul(armLeftTransformation, rotZ(-70));
        armLeftTransformation = matMul(armLeftTransformation, translation(0,this.armLength/2,0));
        armLeftTransformation = matMul(chestTransformation, armLeftTransformation);

        let forearmLeftTransformation = matMul(this.forearmLeftMatrix,translation(0,-this.forearmLength/2,0));
        forearmLeftTransformation = matMul(forearmLeftTransformation, rotX(20));
        forearmLeftTransformation = matMul(forearmLeftTransformation,translation(0,this.forearmLength/2,0));
        forearmLeftTransformation = matMul(armLeftTransformation, forearmLeftTransformation);

        let handLeftTransformation = matMul(forearmLeftTransformation, this.handLeftMatrix);

        // Left leg (on knee)
        let legLeftTransformation = this.legLeftMatrix;
        legLeftTransformation = matMul(spineTransformation, legLeftTransformation);
        

        let shinLeftTransformation = matMul (this.shinLeftMatrix, translation(0,-this.shinLength/2,0));
        shinLeftTransformation = matMul(shinLeftTransformation, rotX(30));
        shinLeftTransformation = matMul(shinLeftTransformation, translation(0,this.shinLength/2,0));
        shinLeftTransformation = matMul(legLeftTransformation, shinLeftTransformation);

        let footLeftTransformation = matMul(shinLeftTransformation, this.footLeftMatrix);

        // // Right leg (on knee)
        let legRightTransformation = this.legRightMatrix;
        legRightTransformation = matMul(spineTransformation, legRightTransformation);
        

        let shinRightTransformation = matMul (this.shinRightMatrix, translation(0,-this.shinLength/2,0));
        shinRightTransformation = matMul(shinRightTransformation, rotX(30));
        shinRightTransformation = matMul(shinRightTransformation, translation(0,this.shinLength/2,0));
        shinRightTransformation = matMul(legRightTransformation, shinRightTransformation);

        let footRightTransformation = matMul(shinRightTransformation, this.footRightMatrix);

        // Apply changes

        this.spine.setMatrix(spineTransformation);
        this.chest.setMatrix(chestTransformation);
        this.neck.setMatrix(neckTransformation);
        this.head.setMatrix(headTransformation);

        this.armRight.setMatrix(armRightTransformation);
        this.forearmRight.setMatrix(forearmRightTransformation);
        this.handRight.setMatrix(handRightTransformation);

        this.armLeft.setMatrix(armLeftTransformation);
        this.forearmLeft.setMatrix(forearmLeftTransformation);
        this.handLeft.setMatrix(handLeftTransformation);

        this.legLeft.setMatrix(legLeftTransformation);
        this.shinLeft.setMatrix(shinLeftTransformation);
        this.footLeft.setMatrix(footLeftTransformation);

        this.legRight.setMatrix(legRightTransformation);
        this.shinRight.setMatrix(shinRightTransformation);
        this.footRight.setMatrix(footRightTransformation);

        boneDict["Spine"].setMatrix(matMul(matMul(this.spine.matrix, translation(0,-this.spineLength/2,0)), inverseOf(boneDict["Spine"].matrixWorld)));
        boneDict["Chest"].setMatrix(matMul(matMul(this.chest.matrix, translation(0,-this.chestLength/2,0)), inverseOf(boneDict["Chest"].matrixWorld))); 
        boneDict["Neck"].setMatrix(matMul(matMul(this.neck.matrix,translation(0, -this.neckLength/2,0)), inverseOf(boneDict["Neck"].matrixWorld))); 
        boneDict["Head"].setMatrix(matMul(matMul(this.head.matrix, translation(0,-this.headLength/2,0)), inverseOf(boneDict["Head"].matrixWorld))); 
        boneDict["Arm_R"].setMatrix(matMul(matMul(this.armRight.matrix, translation(0,-this.armLength/2,0)), inverseOf( boneDict["Arm_R"].matrixWorld))); 
        boneDict["Forearm_R"].setMatrix(matMul(matMul(this.forearmRight.matrix, translation(0,-this.forearmLength/2,0)), inverseOf( boneDict["Forearm_R"].matrixWorld))); 
        boneDict["Arm_L"].setMatrix(matMul(matMul(this.armLeft.matrix, translation(0,-this.armLength/2,0)), inverseOf( boneDict["Arm_L"].matrixWorld)));    
        boneDict["Forearm_L"].setMatrix(matMul(matMul(this.forearmLeft.matrix, translation(0,-this.forearmLength/2,0)), inverseOf( boneDict["Forearm_L"].matrixWorld))); 
        boneDict["Leg_R"].setMatrix(matMul(matMul(this.legRight.matrix, translation(0,-this.legLength/2,0)),inverseOf( boneDict["Leg_R"].matrixWorld ))); 
        boneDict["Shin_R"].setMatrix(matMul(matMul(this.shinRight.matrix, translation(0,-this.shinLength/2,0)),inverseOf( boneDict["Shin_R"].matrixWorld))); 
        boneDict["Leg_L"].setMatrix(matMul(matMul(this.legLeft.matrix, translation(0,-this.legLength/2,0)),inverseOf( boneDict["Leg_L"].matrixWorld)));
        boneDict["Shin_L"].setMatrix(matMul(matMul(this.shinLeft.matrix, translation(0,-this.shinLength/2,0)), inverseOf(boneDict["Shin_L"].matrixWorld))); // Update bone dict for skinning

        buildShaderBoneMatrix();

	}

    animate(t) {
        const speed = 5.5; 
        const amplitudeArm = pi/3; 
        const amplitudeLeg = pi/4;

        const phase = speed * t;

        const spineMatrix = this.spineMatrix;
        const chestMatrix = matMul(spineMatrix, this.chestMatrix);
        const neckMatrix = matMul(chestMatrix, this.neckMatrix);
        const headMatrix = matMul(neckMatrix, this.headMatrix);


        // Arm swing
        let armLeftSwing = rotX(sin(phase) * amplitudeArm);
        let armRightSwing = rotX(-sin(phase) * amplitudeArm);

        // Left arm
        let armLeftTransformation = matMul(this.armLeftMatrix, translation(0,-this.armLength/2,0));
        armLeftTransformation = matMul(armLeftTransformation, armLeftSwing);
        armLeftTransformation = matMul(armLeftTransformation, translation(0,this.armLength/2,0));
        armLeftTransformation = matMul(chestMatrix, armLeftTransformation);

        let forearmLeftTransformation = matMul(this.forearmLeftMatrix, translation(0,-this.forearmLength/2,0));
        forearmLeftTransformation = matMul(forearmLeftTransformation, rotX(20));
        forearmLeftTransformation = matMul(forearmLeftTransformation, translation(0,this.forearmLength/2,0));
        forearmLeftTransformation = matMul(armLeftTransformation, forearmLeftTransformation);

        let handLeftTransformation = matMul(forearmLeftTransformation, this.handLeftMatrix);

        // Right arm
        let armRightTransformation = matMul(this.armRightMatrix, translation(0,-this.armLength/2,0));
        armRightTransformation = matMul(armRightTransformation, armRightSwing);
        armRightTransformation = matMul(armRightTransformation, translation(0,this.armLength/2,0));
        armRightTransformation = matMul(chestMatrix, armRightTransformation);

        let forearmRightTransformation = matMul(this.forearmRightMatrix, translation(0,-this.forearmLength/2,0));
        forearmRightTransformation = matMul(forearmRightTransformation, rotX(20));
        forearmRightTransformation = matMul(forearmRightTransformation, translation(0,this.forearmLength/2,0));
        forearmRightTransformation = matMul(armRightTransformation, forearmRightTransformation);

        let handRightTransformation = matMul(forearmRightTransformation, this.handRightMatrix);

        // Leg swing
        let legLeftSwing = rotX(-sin(phase) * amplitudeLeg);
        let legRightSwing = rotX(sin(phase) * amplitudeLeg);

        // Left leg
        let legLeftTransformation = matMul(this.legLeftMatrix, translation(0,-this.legLength/2,0));
        legLeftTransformation = matMul(legLeftTransformation, legLeftSwing);
        legLeftTransformation = matMul(legLeftTransformation, translation(0,this.legLength/2,0));
        legLeftTransformation = matMul(spineMatrix, legLeftTransformation);

        let shinLeftTransformation = matMul(legLeftTransformation, this.shinLeftMatrix);
        let footLeftTransformation = matMul(shinLeftTransformation, this.footLeftMatrix);

        let legRightTransformation = matMul(this.legRightMatrix, translation(0,-this.legLength/2,0));
        legRightTransformation = matMul(legRightTransformation, legRightSwing);
        legRightTransformation = matMul(legRightTransformation, translation(0,this.legLength/2,0));
        legRightTransformation = matMul(spineMatrix, legRightTransformation);

        let shinRightTransformation = matMul(legRightTransformation, this.shinRightMatrix);
        let footRightTransformation = matMul(shinRightTransformation, this.footRightMatrix);

        // Apply changes

        this.spine.setMatrix(spineMatrix);
        this.chest.setMatrix(chestMatrix);
        this.neck.setMatrix(neckMatrix);
        this.head.setMatrix(headMatrix);

        this.armLeft.setMatrix(armLeftTransformation);
        this.forearmLeft.setMatrix(forearmLeftTransformation);
        this.handLeft.setMatrix(handLeftTransformation);

        this.armRight.setMatrix(armRightTransformation);
        this.forearmRight.setMatrix(forearmRightTransformation);
        this.handRight.setMatrix(handRightTransformation);

        this.legLeft.setMatrix(legLeftTransformation);
        this.shinLeft.setMatrix(shinLeftTransformation);
        this.footLeft.setMatrix(footLeftTransformation);

        this.legRight.setMatrix(legRightTransformation);
        this.shinRight.setMatrix(shinRightTransformation);
        this.footRight.setMatrix(footRightTransformation);

        boneDict["Spine"].setMatrix(matMul(matMul(this.spine.matrix, translation(0,-this.spineLength/2,0)), inverseOf(boneDict["Spine"].matrixWorld)));
        boneDict["Chest"].setMatrix(matMul(matMul(this.chest.matrix, translation(0,-this.chestLength/2,0)), inverseOf(boneDict["Chest"].matrixWorld))); 
        boneDict["Neck"].setMatrix(matMul(matMul(this.neck.matrix,translation(0, -this.neckLength/2,0)), inverseOf(boneDict["Neck"].matrixWorld))); 
        boneDict["Head"].setMatrix(matMul(matMul(this.head.matrix, translation(0,-this.headLength/2,0)), inverseOf(boneDict["Head"].matrixWorld))); 
        boneDict["Arm_R"].setMatrix(matMul(matMul(this.armRight.matrix, translation(0,-this.armLength/2,0)), inverseOf( boneDict["Arm_R"].matrixWorld))); 
        boneDict["Forearm_R"].setMatrix(matMul(matMul(this.forearmRight.matrix, translation(0,-this.forearmLength/2,0)), inverseOf( boneDict["Forearm_R"].matrixWorld))); 
        boneDict["Arm_L"].setMatrix(matMul(matMul(this.armLeft.matrix, translation(0,-this.armLength/2,0)), inverseOf( boneDict["Arm_L"].matrixWorld)));    
        boneDict["Forearm_L"].setMatrix(matMul(matMul(this.forearmLeft.matrix, translation(0,-this.forearmLength/2,0)), inverseOf( boneDict["Forearm_L"].matrixWorld))); 
        boneDict["Leg_R"].setMatrix(matMul(matMul(this.legRight.matrix, translation(0,-this.legLength/2,0)),inverseOf( boneDict["Leg_R"].matrixWorld ))); 
        boneDict["Shin_R"].setMatrix(matMul(matMul(this.shinRight.matrix, translation(0,-this.shinLength/2,0)),inverseOf( boneDict["Shin_R"].matrixWorld))); 
        boneDict["Leg_L"].setMatrix(matMul(matMul(this.legLeft.matrix, translation(0,-this.legLength/2,0)),inverseOf( boneDict["Leg_L"].matrixWorld)));
        boneDict["Shin_L"].setMatrix(matMul(matMul(this.shinLeft.matrix, translation(0,-this.shinLength/2,0)), inverseOf(boneDict["Shin_L"].matrixWorld))); // Update bone dict for skinning

        buildShaderBoneMatrix();

        
    }
}

var keyboard = new THREEx.KeyboardState();
var channel = 'p';
var pi = Math.PI;

function init() {

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(8, 10, 8);
    camera.lookAt(0, 3, 0);

    scene = new THREE.Scene();
    scene.add(camera);

    const axesHelper = new THREE.AxesHelper(2); // size 2 units
    scene.add(axesHelper);

    controls = new OrbitControls(camera, container);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    clock = new THREE.Clock();

    boneDict = {}

    boneArray = new Float32Array(12 * 16);

    humanMaterial = new THREE.ShaderMaterial({
        uniforms: {
            bones: {
                value: boneArray
            }
        }
    });

    const shaderLoader = new THREE.FileLoader();
    shaderLoader.load('glsl/human.vs.glsl',
        function (data) {
        humanMaterial.vertexShader = data;
    })
    shaderLoader.load('glsl/human.fs.glsl',
        function (data) {
        humanMaterial.fragmentShader = data;
    })

    // loading manager

    const loadingManager = new THREE.LoadingManager(function () {
        scene.add(humanMesh);
    });

    // collada
    humanGeometry = new THREE.BufferGeometry();
    const loader = new ColladaLoader(loadingManager);
    loader.load('./model/human.dae', function (collada) {
		skinIndices = collada.library.geometries['human-mesh'].build.triangles.data.attributes.skinIndex.array;
        skinWeight = collada.library.geometries['human-mesh'].build.triangles.data.attributes.skinWeight.array;
		realBones = collada.library.nodes.human.build.skeleton.bones;

        buildSkeleton();
        buildShaderBoneMatrix();
        humanGeometry.setAttribute('position', new THREE.BufferAttribute(collada.library.geometries['human-mesh'].build.triangles.data.attributes.position.array, 3));
        humanGeometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeight, 4));
        humanGeometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
        humanGeometry.setAttribute('normal', new THREE.BufferAttribute(collada.library.geometries['human-mesh'].build.triangles.data.attributes.normal.array, 3));

        humanMesh = new THREE.Mesh(humanGeometry, humanMaterial);
        robot = new Robot(humanMesh);
        robot.hideHuman();
    });

    //

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 0).normalize();
    scene.add(directionalLight);

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    //

    window.addEventListener('resize', onWindowResize);
    lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set( - 100,  - 200,  - 100);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    var floorTexture = new THREE.TextureLoader().load('textures/hardwood2_diffuse.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    var floorMaterial = new THREE.MeshBasicMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
    });
    var floorGeometry = new THREE.PlaneGeometry(30, 30);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y -= 2.5;
    scene.add(floor);

}


function buildSkeleton() {
	boneDict["Spine"] = new THREE.Bone();
	boneDict["Chest"] = new THREE.Bone();
	boneDict["Neck"] = new THREE.Bone();
	boneDict["Head"] = new THREE.Bone();
	boneDict["Arm_L"] = new THREE.Bone();
	boneDict["Forearm_L"] = new THREE.Bone();
	boneDict["Arm_R"] = new THREE.Bone();
	boneDict["Forearm_R"] = new THREE.Bone();
	boneDict["Leg_L"] = new THREE.Bone();
	boneDict["Shin_L"] = new THREE.Bone();
	boneDict["Leg_R"] = new THREE.Bone();
	boneDict["Shin_R"] = new THREE.Bone();

 	boneDict['Chest'].matrixWorld = matMul(boneDict['Spine'].matrixWorld, realBones[1].matrix);
	boneDict['Neck'].matrixWorld = matMul(boneDict['Chest'].matrixWorld, realBones[2].matrix);
	boneDict['Head'].matrixWorld = matMul(boneDict['Neck'].matrixWorld, realBones[3].matrix);
	boneDict['Arm_L'].matrixWorld = matMul(boneDict['Chest'].matrixWorld, realBones[4].matrix);
	boneDict['Forearm_L'].matrixWorld = matMul(boneDict['Arm_L'].matrixWorld, realBones[5].matrix);
	boneDict['Arm_R'].matrixWorld = matMul(boneDict['Chest'].matrixWorld, realBones[6].matrix);
	boneDict['Forearm_R'].matrixWorld = matMul(boneDict['Arm_R'].matrixWorld, realBones[7].matrix);
	boneDict['Leg_L'].matrixWorld = matMul(boneDict['Spine'].matrixWorld, realBones[8].matrix);
	boneDict['Shin_L'].matrixWorld = matMul(boneDict['Leg_L'].matrixWorld, realBones[9].matrix);
	boneDict['Leg_R'].matrixWorld = matMul(boneDict['Spine'].matrixWorld, realBones[10].matrix);
	boneDict['Shin_R'].matrixWorld = matMul(boneDict['Leg_R'].matrixWorld, realBones[11].matrix);

}

/**
* Fills the Float32Array boneArray with the bone matrices to be passed to
* the vertex shader
*/
function buildShaderBoneMatrix() {
    var c = 0;
    for (var key in boneDict) {
        for (var i = 0; i < 16; i++) {
            boneArray[c++] = boneDict[key].matrix.elements[i];
        }
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    checkKeyboard();

    updateBody();
    requestAnimationFrame(animate);
    render();
    stats.update();

}

function render() {

    const delta = clock.getDelta();

    renderer.render(scene, camera);

}

/**
* Returns a new Matrix4 as a multiplcation of m1 and m2
*
* @param {Matrix4} m1 The first matrix
* @param {Matrix4} m2 The second matrix
* @return {Matrix4} m1 x m2
*/
function matMul(m1, m2) {
    return new THREE.Matrix4().multiplyMatrices(m1, m2);
}

/**
* Returns a new Matrix4 as a scalar multiplcation of s and m
*
* @param {number} s The scalar
* @param {Matrix4} m The  matrix
* @return {Matrix4} s * m2
*/
function scalarMul(s, m) {
    var r = m;
    return r.multiplyScalar(s)
}

/**
* Returns an array containing the x,y and z translation component
* of a transformation matrix
*
* @param {Matrix4} M The transformation matrix
* @return {Array} x,y,z translation components
*/
function getTranslationValues(M) {
    var elems = M.elements;
    return elems.slice(12, 15);
}

/**
* Returns a new Matrix4 as a translation matrix of [x,y,z]
*
* @param {number} x x component
* @param {number} y y component
* @param {number} z z component
* @return {Matrix4} The translation matrix of [x,y,z]
*/
function translation(x, y, z) {
    return new THREE.Matrix4().set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    );
}

/**
* Returns a new Matrix4 as a rotation matrix of theta radians around the x-axis
*
* @param {number} theta The angle expressed in radians
* @return {Matrix4} The rotation matrix of theta rad around the x-axis
*/
function rotX(theta) {
    let c = cos(theta);
    let s = sin(theta);
    return new THREE.Matrix4().set(
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1
    );
}

/**
* Returns a new Matrix4 as a rotation matrix of theta radians around the y-axis
*
* @param {number} theta The angle expressed in radians
* @return {Matrix4} The rotation matrix of theta rad around the y-axis
*/
function rotY(theta) {
    let c = cos(theta);
    let s = sin(theta);
    return new THREE.Matrix4().set(
         c, 0, s, 0,
         0, 1, 0, 0,
        -s, 0, c, 0,
         0, 0, 0, 1
    );
}

/**
* Returns a new Matrix4 as a rotation matrix of theta radians around the z-axis
*
* @param {number} theta The angle expressed in radians
* @return {Matrix4} The rotation matrix of theta rad around the z-axis
*/
function rotZ(theta) {
    let c = cos(theta);
    let s = sin(theta);
    return new THREE.Matrix4().set(
        c, -s, 0, 0,
        s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
    );
}

/**
* Returns a new Matrix4 as a scaling matrix with factors of x,y,z
*
* @param {number} x x component
* @param {number} y y component
* @param {number} z z component
* @return {Matrix4} The scaling matrix with factors of x,y,z
*/
function scale(x, y, z) {
    return new THREE.Matrix4().set(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    );
}

function inverseOf(M) {
    return new THREE.Matrix4().copy(M).invert();
}

function cos(angle) {
    return Math.cos(angle);
}

function sin(angle) {
    return Math.sin(angle);
}

function checkKeyboard() {
    for (var i = 0; i < 10; i++) {
        if (keyboard.pressed(i.toString())) {
            channel = i;
            break;
        }
    }
}
function updateBody() {

    switch (channel) {
    case 0:
        var t = clock.getElapsedTime();
        robot.animate(t);
        break;

    case 1:
        robot.pose1();
        break;

    case 2:
        robot.pose2();
        break;

    case 3:
        break;

    case 4:
        break;

    case 5:
        break;
    case 6:
        robot.hideRobot();
        break;
    case 7:
        robot.showRobot();
        break;
    case 8:
        robot.hideHuman();
        break;
    case 9:
        robot.showHuman();
        break;
    default:
        break;
    }
}

init();
animate();
