import {
  Vector3,
  UniversalCamera,
  Scene
} from '@babylonjs/core';

export default class Controls{
    walkSpeed:number;
    sprintSpeed:number;

    constructor(private camera:UniversalCamera,private scene:Scene){
        this.walkSpeed = 0.75;
        this.sprintSpeed = 2.5;

        this.setMovement(this.camera,this.scene)
    }

    setMovement(camera:UniversalCamera, scene:Scene):void{

        camera.keysUp.push(87);
        camera.keysLeft.push(65);
        camera.keysDown.push(83);
        camera.keysRight.push(68);

        const observer = this.scene.onKeyboardObservable.add((evt)=>{
            // if(evt.type===2 && evt.event.code ==='Space'){
            //     camera.cameraDirection.y += 1;
            // }

            if(evt.type === 1 && evt.event.code === 'ShiftLeft')
                camera.speed = this.sprintSpeed;
            else if(evt.type === 2)
                camera.speed = this.walkSpeed;
        })
    }

}