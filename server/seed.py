from faker import Faker
import csv

fake = Faker()

num_records = 22000

with open('mock_customers.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['customer_id', 'first_name', 'last_name', 'email', 'phone_number', 'address', 'date_of_birth', 'branch_id'])
    
    for i in range(1, num_records + 1):
        writer.writerow([
            i,
            fake.first_name(),
            fake.last_name(),
            fake.email(),
            fake.phone_number(),
            fake.address().replace('\n', ', '),
            fake.date_of_birth(minimum_age=18, maximum_age=80).strftime('%Y-%m-%d'),
            1  # branch_id
        ])