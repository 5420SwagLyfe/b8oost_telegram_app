const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { telegramId, username, role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (telegram_id, username, role) VALUES ($1, $2, $3) RETURNING *',
            [telegramId, username, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Получение рейтинга
app.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT users.username, leaderboard.total_points FROM leaderboard JOIN users ON leaderboard.user_id = users.id ORDER BY total_points DESC'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Получение достижений пользователя
app.get('/achievements', async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM achievements WHERE user_id = $1',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Добавление нового достижения
app.post('/achievements', async (req, res) => {
    const { userId, achievementName } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO achievements (user_id, achievement_name) VALUES ($1, $2) RETURNING *',
            [userId, achievementName]
        );

        // Отправляем уведомление пользователю
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (user.rows[0] && user.rows[0].telegram_id) {
            await sendNotification(user.rows[0].telegram_id, `You earned a new achievement: ${achievementName}`);
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Создание заявки на челлендж
app.post('/challenge-requests', async (req, res) => {
    const { userId, challengeName, category, description, rewardPoints } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO challenge_requests (user_id, challenge_name, category, description, reward_points) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, challengeName, category, description, rewardPoints]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Получение списка заявок на челлендж
app.get('/challenge-requests', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM challenge_requests ORDER BY created_at DESC'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});