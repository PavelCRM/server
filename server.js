const express = require('express');
const fs = require('fs');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = 'users.json';

app.use(express.json());

// Схема для валидации данных пользователя
const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  secondName: Joi.string().min(1).required(),
  age: Joi.number().integer().min(0).max(150).required(),
  city: Joi.string().min(1)
});

// Middleware для валидации данных пользователя
function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

// Роут создания пользователя
app.post('/users', validateUser, (req, res) => {
  try {
    const { firstName, secondName, age, city } = req.body;
    
    // Чтение данных из файла
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE);
      users = JSON.parse(data);
    }

    // Генерация нового пользователя
    const newUser = {
      id: Date.now().toString(), // Генерация уникального ID
      firstName,
      secondName,
      age,
      city
    };

    // Добавление нового пользователя в массив
    users.push(newUser);

    // Запись обновленных данных в файл
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Роут обновления пользователя
app.put('/users/:id', validateUser, (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, secondName, age, city } = req.body;

    // Чтение данных из файла
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE);
      users = JSON.parse(data);
    }

    // Поиск пользователя по ID
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Обновление данных пользователя
    users[userIndex] = {
      ...users[userIndex],
      firstName: firstName || users[userIndex].firstName,
      secondName: secondName || users[userIndex].secondName,
      age: age || users[userIndex].age,
      city: city || users[userIndex].city
    };

    // Запись обновленных данных в файл
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json(users[userIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Роут получения отдельного пользователя
app.get('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;

    // Чтение данных из файла
    if (!fs.existsSync(USERS_FILE)) {
      return res.status(404).json({ error: 'Users data not found' });
    }

    const data = fs.readFileSync(USERS_FILE);
    const users = JSON.parse(data);

    // Поиск пользователя по ID
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Роут удаления пользователя
app.delete('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;

    // Чтение данных из файла
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE);
      users = JSON.parse(data);
    }

    // Поиск пользователя по ID
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Удаление пользователя из массива
    users.splice(userIndex, 1);

    // Запись обновленных данных в файл
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
