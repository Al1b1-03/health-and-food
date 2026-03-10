-- Установить пользователя alibiadmin@narxoz.kz как администратора
UPDATE users SET role = 'admin' WHERE email = 'alibiadmin@narxoz.kz';
