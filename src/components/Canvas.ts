import React, { useRef, Context } from 'react';
var dateFormat = require("dateformat");

export interface MyCanvasProps {
    name: string;
    image: HTMLImageElement | null;
}

class MyCanvas extends React.Component {
    // Important props:
    // screen - Object with:
    //    image - image data to use directly in assignment to image.src
    //    displaySecs - how long this screen should be displayed for
    // eslint-disable-next-line no-useless-constructor
    currentImage: HTMLImageElement | null;
    props: MyCanvasProps;

    constructor(props: MyCanvasProps) {
        super(props);
        this.props = props;
        this.currentImage = null;
    }

    componentDidUpdate = (prevProps: MyCanvasProps) => {
        //console.log(`Canvas::componentDidUpdate- show the image`);
        this.showImage(this.props.image);
    }

    componentDidMount() {
        //console.log(`Canvas::componentDidMount- show the image`);
        this.showImage(this.props.image);
    }

    componentWillUnmount() {
        // console.log(`Canvas - componentWillUnmount: ${this.props.url}`);
    }

    fadeInImage(ctx: Context, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        return new Promise(function (resolve, reject) {
            console.log("fadeInImage start")
            let opacity = 0;
            function fade() {
                if ((opacity += .05) < 1) {
                    //console.dir(ctx);
                    //console.dir(image);
                    //console.log(`Opacity: ${opacity}`);
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(image, x, y, w, h);
                    //ctx.fillStyle = "rgba(255, 255, 255, opacity)";
                    //el.style.opacity = opacity;
                    requestAnimationFrame(fade);
                } else {
                    console.log("fadeInImage done");
                    resolve();
                }
            }
            fade();
        });
    };

    fadeOutImage(ctx, image: HTMLImageElement) {
        return new Promise(function (resolve, reject) {
            
            console.log("fadeOutImage start")
            let opacity = 1;
            function fade() {
                if ((opacity -= .05) > 0) {
                    //console.dir(ctx);
                    //console.log(`Opacity: ${opacity}`);
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(image.image, image.x, image.y, image.w, image.h);
                    //ctx.fillStyle = "rgba(255, 255, 255, opacity)";
                    //el.style.opacity = opacity;
                    requestAnimationFrame(fade);
                } else {                    
                    console.log("fadeOutImage done")
                    resolve();
                }
            }
            fade();
        });
    };    

    showImage = async (newImage: HTMLImageElement) => {
        if (typeof newImage !== 'undefined' && newImage !== null) {
            console.log(`Canvas::showImage showing image (${this.props.name}).`);
            //console.dir(newImage);
            let canvas: HTMLCanvasElement | null = document.getElementById("myCanvas");
            if (canvas === null) {
                console.log("canvas was null");
                return;
            }
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let ctx = canvas.getContext("2d");

            var wrh = newImage.width / newImage.height;
            var newWidth = canvas.width;
            var newHeight = newWidth / wrh;
            if (newHeight > canvas.height) {
                newHeight = canvas.height;
                newWidth = newHeight * wrh;
            }

            var x = 0;
            var y = 0;

            if (newWidth < canvas.width) {
                x = (canvas.width - newWidth) / 2;
            }

            if (newHeight < canvas.height) {
                y = (canvas.height - newHeight) / 2;
            }

            console.log("before");
            if (this.currentImage !== null) {
                await this.fadeOutImage(ctx, this.currentImage);
            }
            //await this.fadeToBlack(ctx, canvas.width, canvas.height);
            console.log("middle");
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //ctx.fillRect(0, 0, canvas.width, canvas.height);
            //ctx.drawImage(newImage, x, y, newWidth, newHeight);
            await this.fadeInImage(ctx, newImage, x, y, newWidth, newHeight);
            
            console.log("end");

            this.currentImage = {image: newImage, x: x, y: y, w: newWidth, h: newHeight};
            
        } else {
            console.log(`Canvas::showImage is null or undefined, user sees the time.`);
            let canvas = document.getElementById("myCanvas");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let ctx = canvas.getContext("2d");
            ctx.fillStyle = "#003399";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const now = new Date();
            // Canvas Handbook: https://bucephalus.org/text/CanvasHandbook/CanvasHandbook.html
            // Upper left is 0,0

            ctx.fillStyle = 'red';
            ctx.font = '80pt Arial bold';
            ctx.fillText(dateFormat(now, "h:MM TT"),
                canvas.width / 2 - 300, canvas.height / 2);
            // ctx.fillText (dateFormat(now, "dddd, mmm dS, yyyy"),
            //                 canvas.width/2 - 100,canvas.height/2 -50);        
        }
    }

    render() {
        console.log("MyCanvas::render");
        return (<canvas id="myCanvas"></canvas>);
    }
}

export default MyCanvas;