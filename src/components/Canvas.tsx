import React from 'react';
import dateFormat from "dateformat";

export interface MyCanvasProps {
    type: string;                     // "time" or "bitmap"
    resource: string;                 // usually the bitmap URL
    image: HTMLImageElement | null;   // image element to render
    message: string;                  // String to show on the time screen, "Starting..." or an error
}

export class MyCanvas extends React.Component {
   
    // eslint-disable-next-line no-useless-constructor
    currentImage: HTMLImageElement | null;
    props: MyCanvasProps;

    constructor(props: MyCanvasProps) {
        super(props);
        this.props = props;
        this.currentImage = null;
    }

    componentDidUpdate = (prevProps: MyCanvasProps) => {
        this.showImage(this.props.image);
    }

    componentDidMount() {
        this.showImage(this.props.image);
    }

    componentWillUnmount() {
    }

    fadeInImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        return new Promise<void>(function (resolve, reject) {
            let opacity = 0;
            function fade() {
                if ((opacity += .05) < 1) {
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(image, x, y, w, h);
                    requestAnimationFrame(fade); // Queue next frame
                } else {
                    resolve(); // done
                }
            }
            fade(); // Start the fade
        });
    };

    fadeOutImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        return new Promise<void>(function (resolve, reject) {
            let opacity = 1;
            function fade() {
                if ((opacity -= .05) > 0) {
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(image, x, y, w, h);
                    requestAnimationFrame(fade); // Queue next frame
                } else {
                    resolve();  // done
                }
            }
            fade(); // Start the fade
        });
    };

    showImage = async (newImage: HTMLImageElement | null) => {
        if (this.props.type !== "time" && typeof newImage !== 'undefined' && newImage !== null) {
            let canvas: HTMLCanvasElement | null = document.getElementById("myCanvas") as HTMLCanvasElement;
            if (canvas === null) {
                console.log("Canvas:: showImage() - \"myCanvas\" element was null");
                return;
            }
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

            if (ctx === null) {
                console.log("Canvas:: showImage() - Failed to get CanvasRenderingContext2D from canvas");
                return;
            }

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

            if (this.currentImage !== null) {
                await this.fadeOutImage(ctx, this.currentImage, x, y, newWidth, newHeight);
            }
            //await this.fadeToBlack(ctx, canvas.width, canvas.height);
            
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //ctx.fillRect(0, 0, canvas.width, canvas.height);
            //ctx.drawImage(newImage, x, y, newWidth, newHeight);
            await this.fadeInImage(ctx, newImage, x, y, newWidth, newHeight);

            this.currentImage = newImage; //{image: newImage, x: x, y: y, w: newWidth, h: newHeight};
            
        } else {
            // Show a screen with the time, could be there was no screen to show
            if (this.props.type !== "time") 
                console.log(`Canvas::showImage Image is null or undefined, user sees the time.`);

            let canvas: HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

            if (ctx === null) {
                console.log("Canvas:: showImage() - Failed to get CanvasRenderingContext2D from canvas");
                return;
            }

            ctx.fillStyle = "#003366";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const now = new Date();
            // Canvas Handbook: https://bucephalus.org/text/CanvasHandbook/CanvasHandbook.html
            // Upper left is 0,0

            ctx.fillStyle = '#FF2222';
            ctx.font = '200pt Arial bold';
            const timeStr = dateFormat(now, "h:MM TT");
            let timeTextWidth: number = ctx.measureText(timeStr).width;
            ctx.fillText(timeStr, (canvas.width - timeTextWidth) / 2, canvas.height / 2 + 100);  
            
            ctx.fillStyle = '#FF2222';
            ctx.font = '36pt Arial bold';
            
            ctx.fillText(this.props.message, 50, canvas.height - 20);
        }
    }

    render(): React.ReactNode {
        return (<canvas id="myCanvas"></canvas>);
    }
}