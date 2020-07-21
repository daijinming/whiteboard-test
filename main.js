import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import pdfjsLib from "pdfjs-dist";
import workerSrc from 'pdfjs-dist/es5/build/pdf.worker.entry.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


// init
import EasyDrawingBoard from 'easy-drawing-board'

window.onload = function () {
    let draw = null;
    let pdfBase64Arr = [] // pad数据缓存
    const operations = document.getElementById('operations');
    operations.addEventListener('click', function (e) {
        if (e.target.nodeName !== 'BUTTON') return
        let mode = e.target.id
        if (mode === 'clear') {
            draw.clear()

        } else if (mode === 'undo') {
            draw.undo()
        } else {
            draw.setMode(mode)

        }
    }, false)


    const inputEls = document.getElementsByTagName('input');
    Array.prototype.slice.call(inputEls).forEach(ele => {
        ele.addEventListener('change', function (e) {
            switch (e.target.id) {
                case "lineColor":
                case "textColor":
                case "canvasBgColor":
                    draw && draw.config(e.target.id, e.target.value)

                    break;
                case "lineWidth":
                case "eraserSize":
                case "arrowSize":
                case "textFontSize":
                case "textLineHeight":
                    let dom = document.getElementsByClassName(e.target.id)[0];
                    dom.innerHTML = e.target.value
                    draw && draw.config(e.target.id, e.target.value)

                    break;
            }
        })
    });

    // draw = new EasyDrawingBoard(options);
    // window.draw = draw;
    const url = 'Wiki.pdf';

    let pdfDoc = null,
        pageNum = 1,
        pageIsRendering = false,
        pageNumIsPending = null;

    const scale = 1.5,
        // canvas = document.getElementsByTagName("canvas")[0],
        canvas = document.getElementById("pafjs"),
        ctx = canvas.getContext('2d');
    
    //render the page 
    const renderPage = num => {
        pageIsRendering = true;
        //get page
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderCtx = {
                canvasContext: ctx,
                viewport
            };

            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false;
                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }

                // EasyDrawingBoard
                if (!pdfBase64Arr[num - 1]) {
                    pdfBase64Arr[num - 1] = canvas.toDataURL(`image/png`)
                }
                if (!draw) {
                    // init
                    const container = document.getElementsByClassName('container')[0]
                    container.style.display = 'block'
                    container.style.height = canvas.height + 'px'
                    container.style.width = canvas.width + 'px' 
                    const options = {
                        container: container,
                        bgImg: pdfBase64Arr[0]
                    }
                    draw = new EasyDrawingBoard(options);
                } else {
                    // draw 
                    draw.config('bgImg', pdfBase64Arr[num - 1])
                }
            });
            
            //Outpub current page
            document.querySelector("#page-num").textContent = num;

        });
    };

    //check for pages rendering

    const queueRenderPage = num => {
        if (pageIsRendering) {
            pageIsRendering = num;
        }
        else {
            renderPage(num);
        }
    }

    // show prev page
    const showPrevPage = () => {
        if (pageNum <= 1)
            return;
        pageNum--;
        queueRenderPage(pageNum);
    }


    // show next page
    const showNextPage = () => {
        if (pageNum >= pdfDoc.numPages)
            return;
        pageNum++;
        queueRenderPage(pageNum);
    }

    //get document
    pdfjsLib.getDocument(url).promise.then(
        pdfDoc_ => {

            pdfDoc = pdfDoc_;
            console.log('pdfDoc::', pdfDoc);
            document.querySelector("#page-count").textContent = pdfDoc.numPages;
            renderPage(pageNum);
        }
    );


    //button events
    document.querySelector("#prev-page").addEventListener("click", showPrevPage);
    document.querySelector("#next-page").addEventListener("click", showNextPage);


};
