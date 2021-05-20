
// Основной файл приложения на основе Javascript библиотеки Electron

//  Загружаем библиотеки
// Electron для создагия кросплатформеного приложения
// Url и Path помогает нам указывать путь к файлам
// SimpleCrypto используем для шифрования данных при сохранинии в файл
const electron = require('electron');
const format = require('url').format;
const join = require('path').join;
// const SimpleCrypto = require('simple-crypto-js');
// var _secretKey = "some-unique-key";
// var simplecrypto = new SimpleCrypto(_secretKey);
const fs = require('fs')
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const debug = require('electron-debug');

// debug();
//let mainWindow;


// Оснавная функция вызывающаяся при запуске приложения
// Открывает окно размером 1200 на 740 пикселей, и загружает в него контент из файла mainWindow.html
// preload.js используется для передачи данных между окнами, так доступ из одного окна в другое напрямую запрещен.



app.on('ready', function(){
	const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});
	mainWindow.loadURL(format({
		pathname: join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	// Загружаем верхнее меню из шаблона прописаного ниже
	if (process.platform == 'darwin') {
		mainMenuTemplate.unshift({label: ''});
	}
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
});

// Создаем глобальный объект доступный всем окнам
// Содержит информации о пользователе и его результатах контроля и эксперимента
global.obj = {};

// Создаем шаблон верхнего меню
const mainMenuTemplate = [	
	{
		label: 'Выход',
		accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', // Создаем горячии клавиши для выхода из программы
		submenu: [
			{
				label: 'Выход',
				click(){
					dialog.showMessageBox({
						type: 'question',
						title: 'Уверены что хотите выйте?',
						message: 'Уверены что хотите выйте?',
						buttons: ['Выйти', 'Отмена']})
					.then( result => {
						if ( result.response == 0 ) {
							app.quit();
						}
					});
					
				}
			}],
	},
	{
        label: "Редактировать",
        submenu: [
            { label: "Отменить", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Переделывать", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Вырезать", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Копировать", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Вставить", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Выделить все", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
		]}
];