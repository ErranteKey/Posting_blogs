import pytest
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
import os

@pytest.fixture(scope="function") 
def driver():
    """
    Ініціалізує та повертає WebDriver, а потім закриває його.
    Використовує webdriver-manager для автоматичного встановлення драйвера.
    """
    browser_name = os.getenv("BROWSER", "chrome").lower() 
    
    if browser_name == "chrome":
        driver = webdriver.Chrome(service=webdriver.ChromeService(ChromeDriverManager().install()))
    elif browser_name == "firefox":
        driver = webdriver.Firefox(service=webdriver.FirefoxService(GeckoDriverManager().install()))
    elif browser_name == "edge":
        # Для Edge використовуйте EdgeChromiumDriverManager
        from webdriver_manager.microsoft import EdgeChromiumDriverManager
        driver = webdriver.Edge(service=webdriver.EdgeService(EdgeChromiumDriverManager().install()))
    else:
        raise ValueError(f"Unsupported browser: {browser_name}")

    driver.maximize_window()
    yield driver 
    driver.quit() 

@pytest.fixture(scope="session") 
def base_url():
    """Повертає базовий URL вашого додатку."""
    return os.getenv("BASE_URL", "http://localhost:8080")