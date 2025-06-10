import pytest
from pages.login_page import LoginPage
from pages.home_page import HomePage
from utils.helpers import generate_user_data

@pytest.mark.usefixtures("driver", "base_url")
class TestUserAuthentication:

    def test_successful_user_registration(self, driver, base_url):
        #Тест успішної реєстрації нового користувача.
        login_page = LoginPage(driver, base_url)
        home_page = HomePage(driver, base_url)
        user_data = generate_user_data()

        login_page.go_to_login_page()
        login_page.click_sign_up_link()
        login_page.register_user(
            user_data["username"],
            user_data["email"],
            user_data["password"],
            user_data["password"]
        )
        
        # Перевірка на повідомлення "Congrats!" після реєстрації
        home_page.verify_registration_congrats_message() 
        home_page.verify_on_dashboard_page()

    def test_successful_user_login(self, driver, base_url):
        #Тест успішного входу існуючого користувача.
        existing_username = "existing_user_for_test" 
        existing_password = "TestPass123!" 

        login_page = LoginPage(driver, base_url)
        home_page = HomePage(driver, base_url)

        login_page.go_to_login_page()
        login_page.login_user(existing_username, existing_password)
        
        home_page.verify_no_login_message()
        home_page.verify_on_dashboard_page()