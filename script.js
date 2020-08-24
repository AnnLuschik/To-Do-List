let addTaskForm = document.forms.mainForm;
let addTaskInput = addTaskForm.elements.task;
let addTaskDateInput = addTaskForm.elements.date;
let addTaskButton = document.querySelector('.add-button');
let taskList = document.querySelector('.list');
let todoBoard = document.querySelector('.todo-board');

/*-----------------------------------------Functions------------------------------------------*/
// Add new task 
function getTask() {
	let task = document.createElement('li');
	task.classList.add('task');

	let taskText = document.createElement('p');
	taskText.classList.add('task__text');
	taskText.append(document.createTextNode(addTaskInput.value));

	let taskDate = document.createElement('p');
	taskDate.classList.add('task__time');
	taskDate.append(document.createTextNode(addTaskDateInput.value));

	task.append(taskDate);
	task.append(taskText);

	return task;
}

//Get empry fields
function getNoEmptyFields(object) {
	for(let key in object) {
		if (object[key] === '') return false;
	}
	return true;
}

/*---------------------------------------------Events------------------------------*/
addTaskButton.addEventListener('click', function() {
	let newTask = {
		task: addTaskInput.value,
		date: addTaskDateInput.value,
	}

	let check = getNoEmptyFields(newTask);
	
	if(check) {
		taskList.append(getTask());
		addTaskDateInput.value = '';
		addTaskDateInput.value = '';
	} else alert('All fields must be filled out');
});



