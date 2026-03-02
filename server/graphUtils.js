// server/graphUtils.js

const calculateWeight = (courseId, graph) => {
    const course = graph[courseId];
    if (!course) return 0;

    // 1. Breadth: How many courses does this immediately unlock?
    const breadth = course.unlocks.length;

    // 2. Depth: What is the longest chain this course starts?
    // This is a recursive function to find the "Longest Path"
    const getDepth = (id) => {
        const node = graph[id];
        if (!node || node.unlocks.length === 0) return 0;
        
        // Find the depth of all unlocked courses and take the maximum
        const depths = node.unlocks.map(unlockedId => getDepth(unlockedId));
        return 1 + Math.max(...depths);
    };

    const depth = getDepth(courseId);

    // 3. Final Importance Score
    // We can give Depth more "weight" because it represents a bottleneck
    return (depth * 2) + breadth;
};

const buildCurriculumGraph = (courses, prereqs) => {
    const graph = {};

    // First pass: Create the nodes
    courses.forEach(course => {
        graph[course.course_id] = {
            id: course.course_id,
            name: course.course_name,
            prefix: course.course_prefix,
            number: course.course_number,
            credits: course.credits,
            requires: [],
            unlocks: [],
            weight: 0,
            predictedGrade: null,
            isCritical: false
        };
    });

    // Second pass: Map the edges
    prereqs.forEach(edge => {
        const { course_id, prereq_id } = edge;
        if (graph[course_id] && graph[prereq_id]) {
            graph[course_id].requires.push(prereq_id);
            graph[prereq_id].unlocks.push(course_id);
        }
    });

    // THIRD PASS: Calculate the Importance weights
    Object.keys(graph).forEach(courseId => {
        graph[courseId].weight = calculateWeight(courseId, graph);
    });

    return graph;
};

module.exports = { buildCurriculumGraph };