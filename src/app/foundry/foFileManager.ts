import { Tools } from './foTools'
import { PubSub } from './foPubSub'

// ES2015+  https://www.npmjs.com/package/savery
import savery from 'savery';

export class foFileManager {


    writeBlobFile(blob, name, ext) {
        let filenameExt = name + ext;
        savery.save(blob, filenameExt)
        .then((saveryInstance) => {
            console.log('I am complete! Here is the instance to prove it: ', saveryInstance);
        })
        .catch((saveryInstance) => {
            console.log('Oops, something went wrong. :(');

            throw saveryInstance.error;
        });
    };

    writeTextAsBlob(payload, name, ext) {
        let blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
        this.writeBlobFile(blob, name, ext);
    };

    writeTextFileAsync(payload, name, ext, onComplete) {
        this.writeTextAsBlob(payload, name, ext);
        if (onComplete) {
            onComplete(payload, name, ext)
            return;
        }
        PubSub.Pub('textFileSaved', [payload, name, ext]);
    };

    readTextFileAsync(file, ext, onComplete) {
        let reader = new FileReader();
        reader.onload = (evt) => {
            let filename = file.name;
            let name = filename.replace(ext, '');
            let payload = evt.target['result'];
            if (onComplete) {
                onComplete(payload, name, ext);
                return;
            }
            PubSub.Pub('textFileDropped', [payload, name, ext]);
        }
        reader.readAsText(file);
    };

    readImageFileAsync(file, ext, onComplete) {
        let reader = new FileReader();
        reader.onload = (evt) => {
            let filename = file.name;
            let name = filename.replace(ext, '');
            let payload = evt.target['result'];
            if (onComplete) {
                onComplete(payload, name, ext);
                return;
            }
            PubSub.Pub('imageFileDropped', [payload, name, ext]);
        }
        reader.readAsDataURL(file);
    }


    userOpenFileDialog(onComplete, defaultExt:string, defaultValue:string) {

        //http://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful
        //accept='image/*|audio/*|video/*'
        let accept = defaultExt || '.knt,.csv';

        let fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', accept);
        fileSelector.setAttribute('value', defaultValue);
        fileSelector.setAttribute('style', 'visibility: hidden; width: 0px; height: 0px');
        //fileSelector.setAttribute('multiple', 'multiple');
        document.body.appendChild(fileSelector);

        fileSelector.onchange = (event) => {
            let extensionExtract = /\.[0-9a-z]+$/i;

            let files = fileSelector.files;
            let count = files.length;
            let file = count > 0 && files[0];
            let extension = file ? file.name.match(extensionExtract) : [''];
            let ext = extension[0];
            document.body.removeChild(fileSelector);

            if (file && file.type.startsWith('image')) {
                this.readImageFileAsync(file, ext, onComplete);
            }
            else if (file && (Tools.matches(ext,'.knt') || Tools.matches(ext,'.csv') || Tools.matches(ext,'.json') || Tools.matches(ext,'.txt'))) {
                this.readTextFileAsync(file, ext, onComplete);
            }
        }

        if (fileSelector.click) {
            fileSelector.click();
        // } else {
        //     $(fileSelector).click();
        }
       
    }
}

