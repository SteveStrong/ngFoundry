import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'maptokeys', pure: true })
export class MaptoKeysPipe implements PipeTransform {

  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}

@Pipe({ name: 'modelJson' })
export class ModelJsonPipe {
    transform(val) {
        if (val && val.stringify) {
            return val.stringify(val);
        }

        function resolveCircular(key, value) {

            if (key.startsWith('_')) return;

            return value;
        }

        try {
            return JSON.stringify(val, resolveCircular, 3);
        } catch (error) {
            throw error;
        }

    }
}
