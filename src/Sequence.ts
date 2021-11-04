import axios from 'axios';

export interface Screen {
    nextUpdate: number;
    resource: string;
    displaySecs: number;
    refreshMinutes: number;
    image: any | null;
}

export class Sequence {
    nextIndex: number;
    screenList: Array<Screen>;
    updatePeriod: number;
    nullCount: number;
    intervalTimer: any;
    screenListUrl = "http://glimmerhub.com/config/screen-list.json"

    constructor() {
        this.nextIndex = 0;
        this.screenList = [];
        this.updatePeriod = 60;
        this.nullCount = 0;

        const listJson = JSON.parse('{"screens" : [{"resource": "https://i.imgur.com/Whf10Sd.png", "refreshMinutes": 60, "displaySecs": 6}]}');
        this.screenList = listJson.screens;
        //console.log(JSON.stringify(this.screenList, null, 4));
    }

    start = async () => {
        await this.getScreenList();

        this.update(); // Do it once now.
        
        this.intervalTimer = setInterval(this.update, 60*1000);
    }

    getScreenList = async () => {
        try {
            const response = await axios.get(this.screenListUrl);
            this.screenList = response.data.screens as Array<Screen>;

        } catch (e) {
            console.log(`Sequence::getScreenList failed to get data ${e}`);
        }
    }

    update = async () => {
        console.log(`Sequence::update - **********************  Starting  *********************`);
        const now = new Date().getTime();
        if (this.screenList === undefined || this.screenList === null) {
            console.log("ScreenList is undefined.  Skipping update" + this.screenList);
            return;
        }
        
        this.screenList.forEach(async (screen) => {
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
                } else {
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
                }
            } else {
                console.log(`Sequence::update: ${screen.resource} up-to-date`)
            }
        
        });
    }
   

    // TODO: should this just return an image?
    getNext = (): Screen => {
        let item: Screen = this.screenList[this.nextIndex] as Screen;

        if (item.image === null && this.nullCount < 2) {
            // Don't advance the index on a null image the first 2 times
            this.nullCount++
        } else {
            this.nextIndex++
        }

        if (item.image === null ) {
            console.log(`Sequence::getNext: returning null image with 1 sec duration`)
            const nullImage:Screen = {image: null, displaySecs: 5, nextUpdate: 0, refreshMinutes: 0, resource: ""};
            return nullImage;
        }

        if (this.nextIndex >= this.screenList.length)
            this.nextIndex = 0;

        console.log(`Sequence::getNext: resource: ${item.resource} non-null"}`)
        return item;
    }

}