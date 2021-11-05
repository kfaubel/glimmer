import axios from 'axios';

export interface Screen {
    enabled?: boolean;
    month?: string;
    friendlyName: string;
    nextUpdate?: number;
    resource: string;
    displaySecs: number;
    refreshMinutes: number;
    image?: any | null;
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

        //const listJson = JSON.parse('{"screens" : [{"resource": "https://i.imgur.com/Whf10Sd.png", "refreshMinutes": 60, "displaySecs": 6}]}');
        //this.screenList = listJson.screens;
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
            const serverList: Array<Screen> = response.data.screens;
            serverList.forEach((screen) => {
                //console.log(JSON.stringify(screen, null, 4));
                //console.log(`screen.enabled: type: ${typeof screen.enabled}, value: ${screen.enabled}`);
                if (screen.enabled) {
                    // "resource": "https://glimmerstorage.blob.core.windows.net/glimmer/googleTopTen-[01:10].jpg",
                    if (screen.resource.includes("[01:10]")) {                    
                        const resource = screen.resource;
                        for (let i = 1; i <= 10; i++) {
                            let indexStr = `${i}`;
                            if (indexStr.length === 1) {
                                indexStr = "0" + indexStr;
                            }
                            const newResource = resource.replace("[01:10]", indexStr)
                            this.screenList.push({
                                enabled: true,
                                friendlyName: screen.friendlyName + "-" + indexStr,
                                resource: newResource, 
                                month: screen.month,
                                refreshMinutes: screen.refreshMinutes, 
                                displaySecs: screen.displaySecs,
                                nextUpdate: 0
                            });

                            console.log(`Sequence::getScreenList: Adding: ${newResource}`);
                        }
                    } else {
                        screen.nextUpdate = 0;
                        this.screenList.push(screen);
                        console.log(`Sequence::getScreenList: Adding: ${screen.resource}`)
                    }
                } else {
                    console.log(`Sequence::getScreenList: Skipping disabled: ${screen.resource}`)
                }
            })

        } catch (e) {
            console.log(`Sequence::getScreenList failed to get data ${e}`);
        }
    }

    update = async () => {
        console.log(`Sequence::update - **********************  Starting  *********************`);
        const now = new Date().getTime();
        if (this.screenList === undefined || this.screenList === null) {
            console.log("ScreenList is empty.  Skipping update" + this.screenList);
            return;
        }
        
        this.screenList.forEach(async (screen) => {
            if (typeof screen.nextUpdate === "undefined") {
                console.log(`Sequence:: update screen.nextUpdate is undefined, Setting to now.`);
                screen.nextUpdate = now;
            }
            
            //console.log(`Sequence::update: Checking: ${screen.resource} (${screen.nextUpdate}, time until update ${(screen.nextUpdate - now)/1000} secs`);
            if (typeof screen.nextUpdate === "undefined" || screen.nextUpdate < now) {
                console.log(`Sequence::update: Time to update: ${screen.resource}`);
                let result = await axios({
                    url: screen.resource,
                    method: "get",
                    responseType: "arraybuffer",
                    timeout: 5000
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
                        //console.log(`Sequence::update: ${screen.resource} image.onload`);
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

                    screen.nextUpdate = now + (screen.refreshMinutes * 60 * 1000);
                    //console.log(`Sequence::update Updated next update to ${screen.nextUpdate}`);
                    //console.log(`Sequence::update (update-time - now)/60 seconds ${(screen.nextUpdate - now)/60}`);
                }
            } else {
                const secsTilUpdate = (screen.nextUpdate - now)/1000;
                const formattedName = (screen.friendlyName + "                      ").substring(0,20);
                console.log(`Sequence::update: ${formattedName} up-to-date, ${secsTilUpdate.toFixed(0)} secs to go`)
            }
        
        });
    }
   
    getNext = (): Screen => {
        let item: Screen = this.screenList[this.nextIndex] as Screen;

        if (item.image === null && this.nullCount < 2) {
            // Don't advance the index on a null image the first 2 times
            this.nullCount++
        } else {
            this.nextIndex++
        }

        if (item.image === null ) {
            console.log(`Sequence::getNext: returning null image with 5 sec duration`)
            const nullImage:Screen = {image: null, displaySecs: 5, nextUpdate: 0, refreshMinutes: 0, resource: "", friendlyName: "null"};
            return nullImage;
        }

        if (this.nextIndex >= this.screenList.length)
            this.nextIndex = 0;

        return item;
    }

}