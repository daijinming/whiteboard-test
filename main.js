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
    let draw = null, draw2 = null;
    const container = document.getElementsByClassName('container')[0];
    const operations = document.getElementById('operations');
    operations.addEventListener('click', function (e) {
        if (e.target.nodeName !== 'BUTTON') return
        let mode = e.target.id
        if (mode === 'clear') {
            draw.clear()

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
    const options = {
        container
    };
    draw = new EasyDrawingBoard(options);


    const url = 'Wiki.pdf';

    let pdfDoc = null,
        pageNum = 1,
        pageIsRendering = false,
        pageNumIsPending = null;

    const scale = 1.5,
        canvas = document.getElementsByTagName("canvas")[0],
        ctx = canvas.getContext('2d');
    
    //render the page 
    const renderPage = num => {
        pageIsRendering = true;
        //get page
        pdfDoc.getPage(num).then(page => {
            console.log(page);

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
            console.log(pdfDoc);
            document.querySelector("#page-count").textContent = pdfDoc.numPages;
            renderPage(pageNum);
        }
    );


    //button events
    document.querySelector("#prev-page").addEventListener("click", showPrevPage);
    document.querySelector("#next-page").addEventListener("click", showNextPage);


};


