<?php
/*
Plugin Name: Live Order Dashboard
Description: תוסף שמרכז את ההזמנות של WooCommerce ומתעדכן בלייב, כולל תמיכה ב-RTL, עיצוב תאריך קריא וטיימר לזמן שעבר.
Version: 1.3
Author: Roey Erel
*/

// בדיקת WooCommerce
if ( ! in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
    return;
}

// יצירת תפריט בלוח הבקרה
add_action('admin_menu', 'live_order_dashboard_menu');
function live_order_dashboard_menu() {
    add_menu_page(
        'Live Order Dashboard',
        'לוח הזמנות',
        'manage_options',
        'live-order-dashboard',
        'live_order_dashboard_page',
        'dashicons-list-view',
        6
    );
}

// תוכן הדף
function live_order_dashboard_page() {
    echo '<div id="live-order-dashboard">';
    echo '<h1>לוח הזמנות בלייב</h1>';
    echo '<div id="orders">טוען הזמנות...</div>';
    echo '</div>';
}

// AJAX לשליפת הזמנות
add_action('wp_ajax_get_live_orders', 'get_live_orders');
function get_live_orders() {
    $orders = wc_get_orders(array(
        'limit' => 20, // מספר ההזמנות
        'orderby' => 'date',
        'order' => 'DESC',
    ));

    $response = array();
    foreach ($orders as $order) {
        $response[] = array(
            'id' => $order->get_id(),
            'date' => $order->get_date_created()->date('Y-m-d H:i:s'),
            'total' => $order->get_total(),
            'status' => $order->get_status(),
        );
    }

    wp_send_json($response);
}

// טעינת JavaScript ו-CSS
add_action('admin_enqueue_scripts', 'live_order_dashboard_scripts');
function live_order_dashboard_scripts($hook) {
    if ($hook !== 'toplevel_page_live-order-dashboard') {
        return;
    }

    wp_enqueue_script('live-order-dashboard-js', plugin_dir_url(__FILE__) . 'js/live-order-dashboard.js', array('jquery'), '1.2', true);
    wp_localize_script('live-order-dashboard-js', 'dashboardAjax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
    ));

    wp_enqueue_style('live-order-dashboard-css', plugin_dir_url(__FILE__) . 'css/style.css');
}
