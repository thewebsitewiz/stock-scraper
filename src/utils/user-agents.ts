import { UserAgents } from '../interfaces/userAgents';

const userAgents: UserAgents = getUserAgentData();

const chances = [
    0, 2, 4, 5, 7, 10, 12, 14, 17, 20, 24, 27, 31, 34, 39, 43, 49, 58, 69, 82,
];

module.exports.getUserAgent = () => {

    const chancesLength = chances.length;

    const pick = Math.floor(Math.random() * chancesLength);

    let choice: string = "82";
    for (let i = 0; i < chancesLength; i++) {
        if (pick <= chances[i]) {
            choice = chances[i].toString();
        }
        if (pick === chances[i]) {
            break;
        }
    }

    if (choice !== undefined) {
        return userAgents[choice];
    }
}

function getUserAgentData() {
    const userAgents: UserAgents = {
        "82": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
            name: "Chrome 72.0 Win10",
        },
        "69": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
            name: "Chrome 72.0 Win10",
        },
        "58": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
            name: "Firefox Generic Win10",
        },
        "49": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
            name: "Chrome 72.0 Win10",
        },
        "43": {
            agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15",
            name: "Safari 12.0 macOS",
        },
        "39": {
            agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
            name: "Chrome 72.0 macOS",
        },
        "34": {
            agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
            name: "Chrome/72.0.3626.121 Safari/537.36",
        },
        "31": {
            agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
            name: "Firefox Generic Win7",
        },
        "27": {
            agent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0",
            name: "Firefox Generic Linux",
        },
        "24": {
            agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
            name: "Chrome 72.0 macOS",
        },
        "20": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
            name: "Chrome 71.0 Win10",
        },
        "17": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
            name: "Edge 17.0 Win10",
        },
        "14": {
            agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
            name: "Chrome 72.0 Win7",
        },
        "12": {
            agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
            name: "Chrome 72.0 macOS",
        },
        "10": {
            agent: "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
            name: "Firefox 60.0 Linux",
        },
        "7": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36",
            name: "Chrome Generic Win10",
        },
        "6": {
            agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0",
            name: "Firefox Generic MacOSX",
        },
        "5": {
            agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763",
            name: "Edge 18.0 Win10",
        },
        "4": {
            agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
            name: "Chrome 72.0 Win7",
        },
        "2": {
            agent: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
            name: "IE 11.0 for Desktop Win10",
        },
        "0": {
            agent: "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
            name: "IE 11.0 for Desktop Win7",
        },
    };

    return userAgents
}
