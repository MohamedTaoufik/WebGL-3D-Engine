








export class CanvasRecorder {

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas, options = {
        frameRate: 60,
    }) {
        this.record = () => {
            const stream = canvas.captureStream(options.frameRate ?? 60)

            const recorderOptions = {
                audioBitsPerSecond: 0,
                videoBitsPerSecond: 1500000,
                mimeType: 'video/webm'
            }

            const mediaRecorder = new MediaRecorder(stream, recorderOptions)
            const chunks = []

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data)
            }

            mediaRecorder.onstop = (e) => {
                chunks.push(e.data)
                const blob = new Blob(chunks, { 'type': "video/webm" })
                chunks.length = 0
                // dl

                const url = URL.createObjectURL(blob)
                // window.open(url)
                const a = document.createElement("a")
                document.body.appendChild(a)
                a.style = "display: none"
                a.href = url
                const date = new Date()
                a.download = `${date.getFullYear()}_${date.getMonth()}_${date.getDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.webm`
                a.click()
                a.remove()
                URL.revokeObjectURL(url)

            }


            chunks.length = 0
            mediaRecorder.start()
            this.stop = () => {
                this.stop = () => { }
                mediaRecorder.stop()
            }
        }

        this.stop = () => { }
        this.dispose = () => { }
    }
}




