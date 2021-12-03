import axios, { AxiosResponse } from 'axios';

export interface Screen {
    enabled?: boolean;
    type: string;             // "time" or "bitmap"
    month?: string;           // blank or "1:5" for Jan - May
    friendlyName: string;
    nextUpdate?: number;
    resource: string;
    displaySecs: number;
    refreshMinutes: number;
    image?: any | null;
    message: string;
    timeBug: string;
}

export class Sequence {
    nextIndex: number;
    screenList: Array<Screen>;
    updatePeriod: number;
    nullCount: number;
    intervalTimer: any;
    profile: string;
    screenListUrlBase = "http://glimmerhub.com/config/"

    constructor(profile: string) {
        this.nextIndex = 0;
        this.screenList = [];
        this.updatePeriod = 60;
        this.nullCount = 0;
        this.profile = profile;
    }

    start = async () => {
        await this.getScreenList();

        this.update(); // Do it once now.
        
        this.intervalTimer = setInterval(this.update, 60*1000);
    }

    getScreenList = async () => {
        let activeScreens = 0;
        let message = "";
        try {
            let response: AxiosResponse | null = null;
            
            if (this.profile === "") {
                console.log(`Sequence::getScreenList - No porfile`);
                message = `http://host:port/<profile> - no profile`;
                throw new Error("No profile");
            }

            try {
                const url = this.screenListUrlBase + this.profile + ".json";
                console.log(`Sequence::getScreenList - Retreiving: ${url}`)
                response = await axios.get(url, {timeout: 5000});
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        console.log(`Sequence::getScreenList GET result ${err.response.status}`);
                        message = `Profile '${this.profile}' not found (${err.response.status})`;
                    } else {
                        console.log(`Sequence::getScreenList GET result NULL`);
                        message = `Profile '${this.profile}' unknown error`;
                    }
                }

                throw new Error("Error on GET");
            };

            if (response === null) {
                console.log("Sequence::getScreenList - response was null");
                message = "Internal error";
                throw new Error("Response was null");
            }

            console.log(`Sequence::getScreenList GET result ${response.status}`);

            const serverList: Array<Screen> = response.data.screens;
            if (typeof serverList !== "object" || serverList.length === 0) {
                console.log("Sequence::getScreenList - profile was empty or ill formed");
                message = `Profile '${this.profile}' was empty or ill formed`
                throw new Error("Profile was empty")
            }

            serverList.forEach((screen) => {
                screen.image = null;
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
                                type: "bitmap",
                                friendlyName: screen.friendlyName + "-" + indexStr,
                                resource: newResource, 
                                month: screen.month,
                                refreshMinutes: screen.refreshMinutes, 
                                displaySecs: screen.displaySecs,
                                nextUpdate: 0,
                                image: null,
                                message: "",
                                timeBug: screen.timeBug
                            });
                            activeScreens++;
                            console.log(`Sequence::getScreenList: Adding: ${newResource}`);
                        }
                    } else {
                        screen.nextUpdate = 0;
                        screen.message = "";
                        if (typeof screen.timeBug === "undefined")
                            screen.timeBug = "";
                        this.screenList.push(screen);
                        activeScreens++;
                        console.log(`Sequence::getScreenList: Adding: ${screen.resource}`)
                    }
                } else {
                    console.log(`Sequence::getScreenList: Skipping disabled: ${screen.resource}`)
                }
            })

        } catch (e) {
            console.log(`Sequence::getScreenList failed to get data: ${e}`);
        }

        if (message === "" && activeScreens === 0) 
            message = "No active screens";

        if (this.screenList.length === 0) {
            this.screenList.push({
                enabled: true,
                type: "time",
                friendlyName: "No list",
                resource: "", 
                refreshMinutes: 999999, 
                displaySecs: 60,
                nextUpdate: 0,
                image: null,
                message: message,
                timeBug: ""
            });
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
            if (screen.nextUpdate < now) {
                console.log(`Sequence::update: Time to update: ${screen.resource}`);

                if (screen.type === "time") {
                    // Nothing to do, this screen is generated at display time
                    return;
                }
                
                let response: AxiosResponse | null = null;

                try {
                    console.log(`Sequence::getScreenList - Retreiving: ${screen.resource}`);

                    response = await axios({
                        method: "get",
                        url: screen.resource, 
                        responseType: "arraybuffer",
                        timeout: 5000});
                } catch (err) {
                    console.log(JSON.stringify(err, null, 4));
                    if (axios.isAxiosError(err)) {
                        if (err.response) {
                            console.log(`Sequence::update GET result ${err.response.status}`);
                            screen.image = null;
                            screen.message = `${screen.friendlyName}: ${err.response.status}`
                        } else {
                            console.log(`Sequence::getScreenList GET result NULL`);
                            screen.image = null;
                            screen.message = `${screen.friendlyName}: GET - no response`
                        }
                    }
                };                

                //console.log(`Sequence::update: ${screen.resource} GET status: ${response.status}`);

                if (response !== null) {
                    const imageString = Buffer.from(response.data, 'binary').toString('base64');

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
                    }

                    image.onerror = () => {
                        console.error(`Sequence::update: ${screen.resource} image.onerror`);
                        screen.image = null;
                        screen.message = `${screen.friendlyName}: Failed to load image data`
                    }

                    // console.log(`Sequence::update: ${screen.resource} type is ${type} again`);
                    const imgStr = "data:image/" + type + ";base64," + imageString;
                    image.src = imgStr; // This starts the load.  onload or onerror will be called later

                    screen.nextUpdate = now + (screen.refreshMinutes * 60 * 1000);
                }
            } else {
                const secsTilUpdate = (screen.nextUpdate - now)/1000;
                const formattedName = (screen.friendlyName + "                      ").substring(0,20);
                console.log(`Sequence::update: ${formattedName} up-to-date, ${secsTilUpdate.toFixed(0)} secs to go`)
            }
        
        });
    }
   
    getNext = (): Screen => {
        if (this.screenList.length === 0) {
            // Once the screenlist is loaded it will have at least one entry, even if its the "No list" time screen.
            // So, at this point, getScreenList has not finished.
            const startImage:Screen = {
                image: null, 
                type: "time",
                displaySecs: 10, 
                nextUpdate: 0, 
                refreshMinutes: 0, 
                resource: "", 
                friendlyName: "Still starting", 
                message: "Still starting...",
                timeBug: ""};
            return startImage;
        }

        const item: Screen = this.screenList[this.nextIndex] as Screen;

        this.nextIndex++;
        
        if (this.nextIndex >= this.screenList.length)
            this.nextIndex = 0;

        return item;
    }

}