import {toLocalDate} from "./domService.js";

export const modalConfirmWindow = document.querySelector('.modal-confirm');
export const modalAlertWindow = document.querySelector('.modal-alert');
export const modalChangeWindow = document.querySelector('.modal-change-date');

const changeDateForm = document.forms.modalDateForm;
const changeDateInput = changeDateForm.elements.dateInput;

// Открыть модальное окно для подтверждения удаления
export function openModalConfirmWindow() {
	modalConfirmWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';
	let promiseModal = new Promise(function (resolve, reject) {
		modalConfirmWindow.addEventListener('click', function (event) {
			if (event.target.classList.contains('button__confirm')) {
				resolve();
			}
			if (event.target.classList.contains('button__cancel')) {
				reject();
			}
		});
	});
	return promiseModal;
}

// Открыть модальное окно с предупреждением о лимите в 5 задач в блоке DOING
export function openModalAlertWindow() {
	modalAlertWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';
}

// Открыть модальное окно для смены даты при переносе задачи из DONE в TO DO
export function openModalChangeDateWindow() {
	modalChangeWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';

	let promiseModal = new Promise(function (resolve, reject) {
		modalChangeWindow.addEventListener('click', function (event) {
			if (event.target.classList.contains('button__confirm')) {
				if (changeDateInput.value === '') {
					changeDateInput.classList.add('empty-field');
				} else {
					resolve(toLocalDate(changeDateInput.value));
				}
			}
			if (event.target.classList.contains('button__cancel')) {
				reject();
			}
		});
	});
	return promiseModal;
}

// Закрыть модальное окно
export function closeModalWindow(window) {
	window.style.display = 'none';
	document.querySelector('.fogging').style.display = 'none';
	if (window.classList.contains('modal-change-date')) changeDateForm.reset();
}