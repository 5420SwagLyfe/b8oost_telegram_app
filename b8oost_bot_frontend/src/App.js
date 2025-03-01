import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css'; 


const App = () => {
    const [user, setUser] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [challengeRequests, setChallengeRequests] = useState([]); // Состояние для заявок на челлендж

    // Состояния для формы заявки на челлендж
    const [challengeName, setChallengeName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [rewardPoints, setRewardPoints] = useState(0);

    useEffect(() => {
        // Тестовый пользователь
        const testUser = { id: 1, telegram_id: 123456789, username: 'ivan_ivanov', first_name: 'Ivan' };
        setUser(testUser);

        // Загружаем рейтинг
        fetchLeaderboard();

        // Загружаем достижения тестового пользователя
        fetchAchievements(testUser.id);

        // Загружаем заявки на челлендж
        fetchChallengeRequests();
    }, []);

    // Загрузка рейтинга
    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get('/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    // Загрузка достижений пользователя
    const fetchAchievements = async (userId) => {
        try {
            const response = await axios.get(`/achievements?userId=${userId}`);
            setAchievements(response.data);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    };

    // Загрузка заявок на челлендж
    const fetchChallengeRequests = async () => {
        try {
            const response = await axios.get('http://localhost:5000/challenge-requests');
            setChallengeRequests(response.data);
        } catch (error) {
            console.error('Error fetching challenge requests:', error);
        }
    };

    // Добавление нового достижения
    const addAchievement = async () => {
        try {
            const response = await axios.post('http://localhost:5000/achievements', {
                userId: user.id,
                achievementName: 'New Achievement',
            });
            setAchievements([...achievements, response.data]);
            console.log('Achievement added successfully');
        } catch (error) {
            console.error('Error adding achievement:', error);
        }
    };

    // Создание заявки на челлендж
    const createChallengeRequest = async () => {
        const requestData = {
            userId: user.id,
            challengeName: challengeName,
            category: category,
            description: description,
            rewardPoints: rewardPoints,
        };

        console.log('Sending request data:', requestData);

        try {
            const response = await axios.post('http://localhost:5000/challenge-requests', requestData);
            alert('Challenge request created successfully!');
            console.log('Challenge request:', response.data);

            // Очистка формы после успешной отправки
            setChallengeName('');
            setCategory('');
            setDescription('');
            setRewardPoints(0);

            // Обновляем список заявок
            fetchChallengeRequests();
        } catch (error) {
            console.error('Error creating challenge request:', error);
            alert('Failed to create challenge request.');
        }
    };

    return (
        <div className='container justify-content-center text-center'>
            <div className='content'>
                <h1>B8oost pre-alpha</h1>

                {user ? (
                    <div>
                        <h2>Ваш профиль</h2>
                        <p>ID: {user.id}</p>
                        <p>Имя профиля: {user.username}</p>
                        <p>Ваше имя: {user.first_name}</p>
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}

                <h2>Таблица лидеров</h2>
                <ul>
                    {leaderboard.map((entry, index) => (
                        <li key={index}>
                            {entry.username}: {entry.total_points} points
                        </li>
                    ))}
                </ul>

                <h2>Ваши достижения</h2>
                <ul>
                    {achievements.map((achievement, index) => (
                        <li key={index}>{achievement.achievement_name}</li>
                    ))}
                </ul>

                <button onClick={addAchievement}>Add New Achievement</button>

                <h2>Создание заявки</h2>
                <form onSubmit={(e) => { e.preventDefault(); createChallengeRequest(); }}>
                    <div>
                        <label>
                            Название челленджа:
                            <input
                                type="text"
                                className="text-input"
                                placeholder="Введите название"
                                value={challengeName}
                                onChange={(e) => setChallengeName(e.target.value)}
                                required
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Категория:
                            <select
                                className="select-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Выберите категорию</option>
                                <option value="IT">IT</option>
                                <option value="Маркетинг">Маркетинг</option>
                                <option value="Дизайн">Дизайн</option>
                                <option value="Другое">Другое</option>
                            </select>
                        </label>
                    </div>

                    <div>
                        <label>
                            Описание:
                            <textarea
                                className="textarea-input"
                                placeholder="Введите описание"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Ожидаемые баллы:
                            <input
                                className="text-input"
                                type="number"
                                placeholder="Введите количество баллов"
                                value={rewardPoints}
                                onChange={(e) => setRewardPoints(Number(e.target.value))}
                                required
                            />
                        </label>
                    </div>

                    <button 
                    className="submit-button"
                    type="submit">Отправить заявку</button>
                </form>

                <h2>Задания</h2>
                <ul>
                    {challengeRequests.map((request, index) => (
                        <div className='challenge-card'>
                            <li key={index}>
                                <h3>{request.challenge_name}</h3>
                                <p>Категория: {request.category}</p>
                                <p>Описание: {request.description}</p>
                                <p>BP: {request.reward_points}</p>
                                <p>Статус: {request.status}</p>
                                <p>Создано: {new Date(request.created_at).toLocaleString()}</p>
                            </li>
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;
