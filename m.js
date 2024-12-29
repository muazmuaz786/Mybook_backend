const express = require('express');
var cors = require('cors');


  const app = express();
  app.use(cors());
  app.use(express.json());

const { Pool } = require('pg');

// PostgreSQL 설정
const pool = new Pool({
  user: 'postgres',       // PostgreSQL 사용자명
  host: 'localhost',      // 호스트 (로컬 서버의 경우 localhost)
  database: 'postgres', // 사용할 데이터베이스 이름
  password: 'muaz2012', // PostgreSQL 비밀번호
  port: 5432,             // 기본 포트 (5432)
})

  pool.connect().then(() => console.log('connected to PostgreSQL'));


app.get('/', async (req, res) => {res.send('hello this is mybook backend')})

  app.post('/sign_up' , async (req , res) => {
    const { user_name, user_password } = req.body;

    try{
      const existing_user = await pool.query('SELECT * FROM users WHERE user_name = $1 AND user_password = $2',
        [user_name, user_password]
      );
      if(existing_user.rows.length > 0){
        return res.send('the user name or password are already in use');
      };


      const adding_user = await pool.query(
        'INSERT INTO users (user_name, user_password) VALUES ($1, $2) RETURNING user_id',
        [user_name, user_password]
      )
      res.send(`${adding_user.rows[0].user_id}`);

    }catch(err){
        console.log('error in sign_up muaz');
        res.send('error happend');
    }
  })






  app.post('/login', async(req, res) => {
    const { user_name, user_password } = req.body;  

    try{
      const result = await pool.query(
        'SELECT * FROM users WHERE user_name = $1 AND user_password = $2 ',
        [user_name, user_password]
      )

      if(result.rows.length === 1){
        res.send(`${result.rows[0].user_id}`);
      }else{
        res.send('name or password is incorrect');
      }
    }catch(err){
      res.send(`error in login muaz`);
    }
  });


app.post('/adding_plan' , async (req, res) => {
  const { date, book_name, bef_page, bef_time, aft_page, aft_time, user_id } = req.body;

  const checking_plan = await pool.query(
    'SELECT * FROM plans WHERE user_id = $1 AND date = $2', 
    [user_id, date]
  );

  try{
  if(checking_plan.rows.length > 0){
    await pool.query('UPDATE plans SET book_name = $1, bef_page = $2, bef_time = $3, aft_page = $4, aft_time = $5 WHERE user_id = $6 AND date = $7',
      [book_name, bef_page, bef_time, aft_page, aft_time, user_id, date]
    )
    res.send('updated successfully')
  }else{
    await pool.query('INSERT INTO plans (user_id, date, book_name, bef_page, bef_time, aft_page, aft_time) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [user_id, date, book_name, bef_page, bef_time, aft_page, aft_time]
    )
    res.send('saved successfully')
  }}catch (err){
    res.send(err)
  }
})

app.get('/bringing_plan', async (req, res) => {
  const { user_id, date } = req.query;

  const bringing_plan = await pool.query('SELECT * FROM plans WHERE user_id = $1 AND date = $2',
    [user_id, date] 
  );

try{
  if(bringing_plan.rows.length === 0){
    res.send('no data saved');
  }else{
    res.send(bringing_plan.rows);
  }
}catch(err){
  res.send('err in bringing_plan muaz')
}
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});