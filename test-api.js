// Test script for Auto-Expert API
const testData = {
    make: "Toyota",
    model: "Camry",
    year: "2015",
    mileage: "75000",
    problem: "Engine makes rattling noise when starting",
    symptoms: "Loud metallic rattling sound for first 5 seconds after cold start, especially in morning"
};

async function testDiagnosis() {
    console.log('🧪 Testing Auto-Expert API...\n');
    console.log('Test Data:', JSON.stringify(testData, null, 2));
    console.log('\n📡 Sending request to http://localhost:5000/api/diagnosis...\n');

    try {
        const response = await fetch('http://localhost:5000/api/diagnosis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        console.log('Response Status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error:', error);
            process.exit(1);
        }

        const result = await response.json();
        console.log('\n✅ Success! Diagnosis received:\n');
        console.log('='.repeat(80));
        console.log(result.diagnosis);
        console.log('='.repeat(80));
        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testDiagnosis();
