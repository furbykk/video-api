import {Request, Response} from "express"
import fs = require("node:fs");
import path = require("node:path");
import {readdir} from "node:fs";
import {exec} from "node:child_process";


class FileOperationController {
    static async fetchPath(req: Request, resp: Response) {
        console.log('Hi, I am from server\'s fetchPath')

        try {
            // const {name, age} = req.body;
            console.log('__dirname=', __dirname)
            const myPathName = __dirname + '/../../' + 'text1.txt'
            const data = fs.readFileSync(myPathName, 'utf8')


            // write content to file
            const content = 'Hello World' + new Date().toISOString()
            fs.writeFileSync(path.join(__dirname, '/../../text2.txt'), content, 'utf8')


            resp.send(data)
        } catch (error) {
            console.log(error)
            resp.status(500).send('Internal Server Error')
        }
    }

    static async takePhoto(req: Request, resp: Response) {
        const {num} = req.body;
        if(!num) {
            resp.status(400).send('Please set the number of pictures to capture, num can only be 1-5')
            return
        }
        if(num<0 || num>5) {
            resp.status(400).send('Invalid num, num can only be 1-5')
            return
        }

        const NodeWebcam = require("node-webcam");

        let opts = {
            width: 1280,
            height: 720,
            quality: 100,
            frames: 60,
            delay: 0,
            saveShots: true,
            output: "jpeg",
            device: false,
            callbackReturn: "location",
            verbose: false
        }

        let timestamp = Date.now()
        let i =1;
        let interval = setInterval(()=>{
            let photoName = `${timestamp}_${i}.jpg`
            NodeWebcam.capture( `${__dirname}/../../photos/${photoName}`, opts, function( err, data ) {
                if(!err){
                    console.log(`Pictures taken successfully， ${data} created`)
                }
                else {
                    console.log("Errors in taking picutures", err);
                }
            })
            i ++;
        }, 5000)

        setTimeout(() => {
            clearInterval(interval);
            console.log(`${num} pictures captured`);
        }, 5000*num+4000);

        resp.status(200).send(`Get ready, cam will start to capture ${num} pictures in 5s`);
    }

    static async getPhotos(req: Request, resp: Response) {

        let path = `${__dirname}/../../photos`
        try {
            const files = fs.readdirSync(path)
            files.forEach((file)=>{
                console.log(file)
            })
            resp.status(200).send(files)
        } catch (err) {
            console.error(err);
            resp.status(500).send('Internal server error')
        }
    }

    static async ffmpeg(req: Request, resp: Response) {
        const timestamp = Date.now()
        const outputFilePath = path.join(`${__dirname}/../../videos`, `recording_${timestamp}.mp4`);
        const outputWithWatermarkFilePath = path.join(`${__dirname}/../../videos`, `recording_watermark_${timestamp}.mp4`);
        const watermarkPath = path.join(`${__dirname}/../../videos`, `watermark.png`);
        let ffmpegProcess = null;

        // const ffmpegCommand = `ffmpeg -f x11grab -video_size cif -framerate 25 -i :0.0 -codec:v libx264 -preset ultrafast -pix_fmt yuv420p -qp 0 ${outputFilePath}`;
        let ffmpegCommand = `ffmpeg -f avfoundation -i "Capture screen 0" ${outputFilePath}`;
        ffmpegProcess = exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`FFmpeg error: ${error.message}`);
            }
            console.log(`FFmpeg output: ${stdout}`);
            console.error(`FFmpeg error output: ${stderr}`);
        });

        setTimeout(()=>{
            // ffmpegProcess.kill('SIGINT');
            ffmpegProcess.stdin.write('q')
            ffmpegProcess = null;

            setTimeout(()=>{
                ffmpegCommand = `ffmpeg -i ${outputFilePath} -i ${watermarkPath} -filter_complex "overlay=10:10" -codec:a copy ${outputWithWatermarkFilePath}`;
                console.log('adding watermark...', ffmpegCommand)
                exec(ffmpegCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`FFmpeg error: ${error.message}`);
                        // return resp.status(500).send('Failed to add watermark to the video.');
                    }
                    console.log(`FFmpeg output: ${stdout}`);
                    console.error(`FFmpeg error output: ${stderr}`);
                    // resp.send(`Watermark added successfully. Output file: ${outputWithWatermarkFilePath}`);
                });
            }, 2000)
                // ffmpegProcess = null;

        }, 10000)
        resp.send('Get Ready.  10s screen video will be captured.');
    }

}

export default  FileOperationController