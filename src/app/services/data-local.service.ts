import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Registro } from '../models/registro.model';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

const { Storage } = Plugins;
const { Browser } = Plugins;
const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  registros: Registro[] = [];

  constructor(private navCtrl: NavController) {
    this.cargarRegistros();
  }

  async guardarRegistro(format: string, text: string) {
    const registro = new Registro(format, text);
    this.registros.unshift(registro);

    await Storage.set({
      key: 'registros',
      value: JSON.stringify(this.registros)
    });

    this.abrirRegistro(registro);
  }

  async cargarRegistros() {
    const reg = await Storage.get({ key: 'registros' });
    if (reg.value === null) {
      this.registros = [];
      return;
    }
    this.registros = JSON.parse(reg.value);
  }

  async abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');
    switch (registro.type) {
      case 'http':
        await Browser.open({ url: registro.text });
        break;
      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;
      default:
        break;
    }
  }

  enviarCorreo() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Fecha, Texto\n';

    arrTemp.push(titulos);
    this.registros.forEach(registro => {
      const fila = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;
      arrTemp.push(fila);
    });
    this.crearArchivo(arrTemp.join(''));
  }

  crearArchivo(text: string) {
    this.fileWrite(text);
  }

  async fileWrite(text: string) {
    try {
      const result = await Filesystem.writeFile({
        path: 'registros.csv',
        data: text,
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8
      });
      console.log('Write file', result);
    } catch (e) {
      console.error('Unable to write file', e);
    }
  }
}
