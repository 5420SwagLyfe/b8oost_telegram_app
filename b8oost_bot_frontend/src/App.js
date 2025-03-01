import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('');
    const [challengeRequests, setChallengeRequests] = useState([]);

    // Состояния для формы заявки на челлендж
    const [challengeName, setChallengeName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [rewardPoints, setRewardPoints] = useState(0);

    useEffect(() => {
        const tg = window.Telegram.WebApp;
        tg.ready();

        const initData = tg.initDataUnsafe;
        if (initData.user) {
            const telegramId = initData.user.id;
            const username = initData.user.username || 'Unknown';
            const firstName = initData.user.first_name || 'User';

            // Регистрируем пользователя
            registerUser(telegramId, username, firstName);

            // Получаем роль пользователя
            axios.post('/login', { telegramId: telegramId })
                .then(response => {
                    setRole(response.data.role);
                    setUser({
                        id: telegramId,
                        username: username,
                        first_name: firstName,
                    });

                    // Загружаем заявки на челлендж
                    fetchChallengeRequests();
                })
                .catch(error => {
                    console.error('Error fetching user role:', error);
                });
        }
    }, []);

    const registerUser = async (telegramId, username, firstName) => {
        try {
            const response = await axios.post('/register', {
                telegramId: telegramId,
                username: username,
                firstName: firstName,
                role: 'employee', // По умолчанию роль "сотрудник"
            });
            console.log('User registered:', response.data);
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    const fetchChallengeRequests = async () => {
        try {
            const response = await axios.get('/challenge-requests');
            setChallengeRequests(response.data);
        } catch (error) {
            console.error('Error fetching challenge requests:', error);
        }
    };

    const createChallengeRequest = async () => {
        const requestData = {
            userId: user.id,
            challengeName: challengeName,
            category: category,
            description: description,
            rewardPoints: rewardPoints,
        };

        try {
            const response = await axios.post('/challenge-requests', requestData);
            alert('Заявка успешно создана!');
            console.log('Challenge request:', response.data);

            // Очистка формы
            setChallengeName('');
            setCategory('');
            setDescription('');
            setRewardPoints(0);

            // Обновляем список заявок
            fetchChallengeRequests();
        } catch (error) {
            console.error('Error creating challenge request:', error);
            alert('Не удалось создать заявку.');
        }
    };

    const updateRequestStatus = async (requestId, status) => {
        try {
            const response = await axios.post('/update-request-status', {
                requestId: requestId,
                status: status,
            });
            alert('Статус заявки обновлен!');
            console.log('Request status update:', response.data);

            // Обновляем список заявок
            fetchChallengeRequests();
        } catch (error) {
            console.error('Error updating request status:', error);
            alert('Не удалось обновить статус заявки.');
        }
    };

    // Меню для сотрудника
    const renderEmployeeMenu = () => (
        <div>
            <h2>Подать заявку на челлендж</h2>
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
                        Награда в виде баллов:
                        <input
                            type="number"
                            className="text-input"
                            placeholder="Введите количество баллов"
                            value={rewardPoints}
                            onChange={(e) => setRewardPoints(Number(e.target.value))}
                            required
                        />
                    </label>
                </div>

                <button type="submit" className="submit-button">Отправить заявку</button>
            </form>
        </div>
    );

    // Меню для руководителя
    const renderManagerMenu = () => (
        <div>
            <h2>Заявки на челлендж</h2>
            <ul>
                {challengeRequests.map((request, index) => (
                    <li key={index} className="challenge-card">
                        <h3>{request.challenge_name}</h3>
                        <p><strong>Категория:</strong> {request.category}</p>
                        <p><strong>Описание:</strong> {request.description}</p>
                        <p><strong>Награда:</strong> {request.reward_points} баллов</p>
                        <p className="status"><strong>Статус:</strong> {request.status}</p>
                        <p className="created-at"><strong>Дата создания:</strong> {new Date(request.created_at).toLocaleString()}</p>

                        {request.status === 'pending' && (
                            <div>
                                <button onClick={() => updateRequestStatus(request.id, 'approved')}>Одобрить</button>
                                <button onClick={() => updateRequestStatus(request.id, 'rejected')}>Отклонить</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="container">
            <div className="content">
                <h1>Welcome to the Mini App!</h1>

                {user ? (
                    <div>
                        <h2>Your Profile</h2>
                        <p>User ID: {user.id}</p>
                        <p>Username: {user.username}</p>
                        <p>First Name: {user.first_name}</p>
                        <p>Role: {role}</p>
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}

                {/* Меню для сотрудника */}
                {role === 'employee' && renderEmployeeMenu()}

                {/* Меню для руководителя */}
                {role === 'manager' && renderManagerMenu()}
            </div>
        </div>
    );
};

export default App;