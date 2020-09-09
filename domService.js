// Создать новую задачу
export function getTask(taskData) {
	let task = document.createElement('li');
	task.classList.add('task');
	task.setAttribute('data-id', taskData.id);
	task.append(createTextContainer(taskData));
	task.append(createIconContainer());
	return task;
}

// Создание текстовой части новой задачи
function createTaskTimeElement(time) {
	let taskDate = document.createElement('p');
	taskDate.classList.add('task__time');
	taskDate.append(document.createTextNode(toLocalDate(time)));
	return taskDate;
}

function createTaskTextElement(text) {
	let taskText = document.createElement('p');
	taskText.classList.add('task__text');
	taskText.append(document.createTextNode(text));
	return taskText;
}

function createTextContainer(taskData) {
	let container = document.createElement('div');
	container.classList.add('text-container');
	container.append(createTaskTimeElement(taskData.date));
	container.append(createTaskTextElement(taskData.task));
	return container;
}

// Создание 'delete' и 'remove' кнопок
function createDeleteIcon() {
	let icon = document.createElement('button');
	icon.classList.add('icon', 'close-icon');
	return icon;
}

function createRemoveIcon() {
	let icon = document.createElement('button');
	icon.classList.add('icon', 'remove-icon');
	return icon;
}

function createIconContainer() {
	let container = document.createElement('div');
	container.classList.add('icon-container');
	container.append(createDeleteIcon(), createRemoveIcon());
	return container;
}

// Перевод даты в формат dd.mm.yyyy
export function toLocalDate(date) {
	let localDate = date.split('-');
	return localDate.reverse().join('.');
}