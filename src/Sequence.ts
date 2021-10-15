import axios from 'axios';

import screenListConfig from "./screenlist.json";

interface Screen {
    nextUpdate: number;
    resource: string;
    refreshMinutes: number;
    image: any | null;
}

class Sequence {
    nextIndex: number;
    screenList: Array<Screen>;
    updatePeriod: number;
    nullCount: number;
    intervalTimer: any;
    constructor() {
        this.nextIndex = 0;
        this.screenList = [];
        this.updatePeriod = 60;
        this.nullCount = 0;

        this.screenList = screenListConfig.list;

        this.update(); // Do it once now.
        
        this.intervalTimer = setInterval(this.update, 60*1000);
    }

    update = async () => {
        console.log(`Sequence::update - **********************  Starting  *********************`);
        const now = new Date().getTime();
        for (const screen of this.screenList) {
            console.log(`Sequence::update: Checking: ${screen.resource}`);
            if (typeof screen.nextUpdate === 'undefined' || screen.nextUpdate < now) {
                console.log(`Sequence::update: Time to update: ${screen.resource}`);
                let result = await axios({
                    url: screen.resource,
                    method: "get",
                    responseType: "arraybuffer"
                })

                console.log(`Sequence::update: ${screen.resource} GET status: ${result.status}`);

                if (result.status !== 200) {
                    screen.image = null;
                    continue;
                }
                const imageString = Buffer.from(result.data, 'binary').toString('base64');

                let type;
                if (imageString.charAt(0) === '/') {
                    type = "jpeg";
                } else if (imageString.charAt(0) === 'i') {
                    type = "png";
                } else if (imageString.charAt(0) === 'R') {
                    type = "gif";
                } else if (imageString.charAt(0) === 'U') {
                    type = "webp";
                } else {
                    type = "";
                }

                // console.log(`Sequence::update: ${screen.resource} type is ${type}`);
                let image = new Image();

                image.onload = () => {
                    console.log(`Sequence::update: ${screen.resource} image.onload`);
                    screen.image = image;
                    // console.dir(image);
                    // this.showImage(image); - we will do this in Canvas
                }

                image.onerror = () => {
                    console.error(`Sequence::update: ${screen.resource} image.onerror`);
                    screen.image = null;
                }

                // console.log(`Sequence::update: ${screen.resource} type is ${type} again`);
                const imgStr = "data:image/" + type + ";base64," + imageString;
                // console.log(`Sequence::update Assigning data to image: ${imgStr}`);
                image.src = imgStr;

                screen.nextUpdate = now + (screen.refreshMinutes * 3600);
                console.log(`Sequence::update Updated next update to ${screen.nextUpdate}`);
                console.log(`Sequence::update (update-time - now)/60 seconds ${(screen.nextUpdate - now)/60}`);
            } else {
                console.log(`Sequence::update: ${screen.resource} up-to-date`)
            }
        }
    }

    getNext = (): Screen | null => {
        let item = this.screenList[this.nextIndex];

        if (item.image === null && this.nullCount < 2) {
            // Don't advance the index on a null image the first 2 times
            this.nullCount++
        } else {
            this.nextIndex++
        }

        if (item.image === null ) {
            console.log(`Sequence::getNext: returning null image with 1 sec duration`)
            const nullImage = {image: null, displaySecs: 5};
            return nullImage;
        }

        if (this.nextIndex >= this.screenList.length)
            this.nextIndex = 0;

        console.log(`Sequence::getNext: resource: ${item.resource} non-null"}`)
        return item;
    }

}

export default Sequence;