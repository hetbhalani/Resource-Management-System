**Resource Management System**

The **Resource Management System** helps organizations manage and use shared resources like classrooms, computer labs, auditoriums, and other facilities in one place. It streamlines the process of booking, using, and maintaining these resources, making it faster, more transparent, and entirely paperless.

- **Purpose and Objective**

Every organization has various shared resources needed for meetings, events, or daily operations. Managing these resources manually can be challenging and often leads to confusion, double bookings, or poor use. The Resource Management System was created to address these issues by digitizing the whole process.

By bringing all resource-related activities onto one digital platform, it ensures better organization, transparency, and proper utilization of every available resource.

- **Resource Type**

Resources are organized into categories based on their type, such as classrooms, labs, and auditoriums. Grouping resources helps users quickly find what they need and allows the system to provide accurate reports and insights.  

- **Maintenance**

Maintenance is an important part of the system. Each resource may have different types of maintenance activities, such as cleaning, repairing, or servicing. Depending on the configuration, the system can automatically send alerts or reminders to maintenance staff when a booking is approved or when regular servicing is due. This keeps all resources in good condition and ensures they are always ready for use.

- **Facilities Management**

Many resources come with additional facilities or features. For example, a meeting hall might include air conditioning, a projector, or a sound system. The system stores details about these facilities so that users know exactly what is available when making a booking. This avoids confusion and ensures proper planning for meetings or events.

- **Building Information**

The system stores all buildings with their name, number, and total floors, helping link resources to their locations.

- **Resource Booking Process**

The booking process is simple and user-friendly. An employee or student can log in, select a resource, choose a date and time, and submit a booking request. The system checks whether the resource is available at that time.

If the resource requires approval, the request is sent to the designated approver. Once approved, the employee or student receives confirmation, and the booking becomes active. If the organization has chosen to notify maintenance staff on approval, they are automatically alerted to prepare the resource.

- **Cupboard & Shelf**

Cupboards help organize storage in rooms. Each cupboard has several shelves. Cupboards hold information such as their name, location, and number of shelves. Shelves keep track of individual storage units, including identifiers, capacities, and descriptions. This setup allows for effective management of stored resources and makes inventory tracking easier.

- **Reports and Analysis**

The system provides reports to help management review usage and performance.

You can view and download reports for:

- Resource-wise bookings
- Resource Type-wise usage
- Maintenance history
- Booking approvals and rejections
- Monthly or yearly summaries

- **Dashboard**

The dashboard gives a quick view of:

- Total resources and bookings
- Upcoming bookings
- Pending approvals
- Maintenance alerts
- Monthly usage charts

- **Key Benefits**

- Easy and fast booking process
- Reduces paperwork and manual effort.
- Automatic approval and maintenance alerts based on system configuration
- All information stored safely in one place
- Simple reporting for audit and analysis
- Better use of resources with fewer conflicts
- Time-saving and transparent workflow

- **Conclusion**

The Resource Management System (RMS) offers a complete digital solution for managing all organizational resources in one place. It simplifies the entire process of booking, approval, and maintenance, ensuring that every resource is used effectively and responsibly.

By replacing manual processes with an online system, it saves time, reduces errors, and increases transparency. Configurable settings like automatic approvals and maintenance alerts make it adaptable for different organizational needs.

# Database

## Table Name: users

| **Column Name** | **Type** |
| --- | --- |
| user_id | INT |
| name | VARCHAR(100) |
| email | VARCHAR(100) |
| role | VARCHAR(20) |
| password | VARCHAR(255) |
| created_at | DATETIME |

## Table Name: resource_types

| **Column Name** | **Type** |
| --- | --- |
| resource_type_id | INT |
| type_name | VARCHAR(100) |

## Table Name: buildings

| **Column Name** | **Type** |
| --- | --- |
| building_id | INT |
| building_name | VARCHAR(100) |
| building_number | VARCHAR(50) |
| total_floors | INT |

## Table Name: resources

| **Column Name** | **Type** |
| --- | --- |
| resource_id | INT |
| resource_name | VARCHAR(100) |
| resource_type_id | INT |
| building_id | INT |
| floor_number | INT |
| description | TEXT |

## Table Name: facilities

| **Column Name** | **Type** |
| --- | --- |
| facility_id | INT |
| resource_id | INT |
| facility_name | VARCHAR(100) |
| details | TEXT |

## Table Name: maintenance

| **Column Name** | **Type** |
| --- | --- |
| maintenance_id | INT |
| resource_id | INT |
| maintenance_type | VARCHAR(100) |
| scheduled_date | DATE |
| status | VARCHAR(20) |
| notes | TEXT |

## Table Name: bookings

| **Column Name** | **Type** |
| --- | --- |
| booking_id | INT |
| resource_id | INT |
| user_id | INT |
| start_datetime | DATETIME |
| end_datetime | DATETIME |
| status | VARCHAR(20) |
| approver_id | INT |
| created_at | DATETIME |

## Table Name: cupboards

| **Column Name** | **Type** |
| --- | --- |
| cupboard_id | INT |
| resource_id | INT |
| cupboard_name | VARCHAR(100) |
| total_shelves | INT |

## Table Name: shelves

| **Column Name** | **Type** |
| --- | --- |
| shelf_id | INT |
| cupboard_id | INT |
| shelf_number | INT |
| capacity | INT |
| description | TEXT |